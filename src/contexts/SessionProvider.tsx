import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import type { User } from '@supabase/supabase-js';
import * as LocalAuthentication from 'expo-local-authentication';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AppState, Platform, View } from 'react-native';

import { registrarTokenPush } from '../services/notificacoes';
import { supabase } from '../services/supabase';

type SessionContextType = {
  user: User | null;
  busy: boolean;
  reason: string;
  login: (email: string, password: string) => Promise<void>;
  logout: (message?: string) => Promise<void>;
  touch: () => void;
  enableNative: (enabled: boolean) => Promise<void>;
};

const SessionContext = createContext<SessionContextType | null>(null);

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error(
      'useSession deve ser usado dentro de SessionProvider'
    );
  }

  return context;
}

export function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');

  const lease = useRef<string | null>(null);
  const activity = useRef(0);
  const lastSentActivity = useRef(0);
  const active = useRef(false);
  const generation = useRef(0);
  const signingOut = useRef(false);
  const renewing = useRef(false);
  const nativePrompt = useRef(false);
  const backgroundDuringPrompt = useRef(false);

  const touch = useCallback(() => {
    if (active.current) {
      activity.current = Date.now();
    }
  }, []);

  const logout = useCallback(
    async (message = 'Sessão encerrada') => {
      if (signingOut.current) return;

      signingOut.current = true;
      generation.current += 1;
      active.current = false;

      setUser(null);
      setReason(message);

      const previous = lease.current;
      lease.current = null;

      try {
        if (previous) {
          await supabase.rpc('end_session', {
            p_id: previous,
          });
        }
      } catch {
        // A concessão expira no servidor.
      } finally {
        try {
          await supabase.auth.signOut({
            scope: 'local',
          });
        } finally {
          signingOut.current = false;
        }
      }
    },
    []
  );

  const login = useCallback(
    async (email: string, password: string) => {
      if (signingOut.current) return;

      setBusy(true);
      setReason('');

      const attempt = ++generation.current;

      try {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        if (!data.user) {
          throw new Error('Usuário não encontrado');
        }

        const enabled = await AsyncStorage.getItem(
          'native:' + data.user.id
        );

        if (enabled === 'true') {
          if (Platform.OS === 'web') {
            throw new Error(
              'Confirmação biométrica requer aplicativo nativo'
            );
          }

          const available =
            await LocalAuthentication.hasHardwareAsync();

          const enrolled =
            await LocalAuthentication.isEnrolledAsync();

          if (!available || !enrolled) {
            throw new Error(
              'Biometria indisponível no aparelho'
            );
          }

          nativePrompt.current = true;
          backgroundDuringPrompt.current = false;

          let result;

          try {
            result =
              await LocalAuthentication.authenticateAsync({
                promptMessage: 'Confirmar entrada',
                cancelLabel: 'Cancelar',
              });
          } finally {
            nativePrompt.current = false;
          }

          if (
            !result.success ||
            backgroundDuringPrompt.current
          ) {
            throw new Error(
              'Entrada nativa não autorizada'
            );
          }
        }

        if (
          attempt !== generation.current ||
          (Platform.OS !== 'web' &&
            AppState.currentState !== 'active')
        ) {
          throw new Error('Entrada interrompida');
        }

        const {
          data: sessionId,
          error: leaseError,
        } = await supabase.rpc('begin_session');

        if (leaseError) throw leaseError;

        lease.current = sessionId as string;

        if (attempt !== generation.current) {
          await logout('Entrada interrompida');
          return;
        }

        activity.current = Date.now();
        lastSentActivity.current = 0;
        active.current = true;
        setUser(data.user);

        void registrarTokenPush().catch((erro) => {
          console.warn('Não foi possível registrar notificações push:', erro);
        });
        
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Falha no login';

        await logout(message);
      } finally {
        setBusy(false);
      }
    },
    [logout]
  );

  const enableNative = useCallback(
    async (enabled: boolean) => {
      if (!user) return;

      if (enabled) {
        if (Platform.OS === 'web') {
          throw new Error(
            'Biometria disponível apenas no aplicativo nativo'
          );
        }

        const available =
          await LocalAuthentication.hasHardwareAsync();

        const enrolled =
          await LocalAuthentication.isEnrolledAsync();

        if (!available || !enrolled) {
          throw new Error(
            'Cadastre biometria no aparelho'
          );
        }

        nativePrompt.current = true;
        backgroundDuringPrompt.current = false;

        let result;

        try {
          result =
            await LocalAuthentication.authenticateAsync({
              promptMessage: 'Ativar entrada nativa',
            });
        } finally {
          nativePrompt.current = false;
        }

        if (
          !result.success ||
          backgroundDuringPrompt.current
        ) {
          throw new Error('Ativação cancelada');
        }
      }

      await AsyncStorage.setItem(
        'native:' + user.id,
        String(enabled)
      );

      touch();
    },
    [user, touch]
  );

  useEffect(() => {
    const appListener = AppState.addEventListener(
      'change',
      (state) => {
        if (Platform.OS === 'web') return;

        if (nativePrompt.current) {
          if (state === 'background') {
            backgroundDuringPrompt.current = true;

            void logout(
              'Aplicativo em segundo plano'
            );
          }

          return;
        }

        if (
          state === 'background' &&
          active.current
        ) {
          void logout(
            'Aplicativo saiu do primeiro plano'
          );
        }
      }
    );

    let falhasConfirmadas = 0;
    let geracaoValidada = -1;
    let versaoRede = 0;

    const validarSessao = async () => {
      if (!active.current) return;

      if (Date.now() - activity.current >= 120000) {
        void logout('Sessão expirada por inatividade');
        return;
      }

      if (renewing.current) return;
      renewing.current = true;
      const tentativa = generation.current;
      if (geracaoValidada !== tentativa) {
        geracaoValidada = tentativa;
        falhasConfirmadas = 0;
      }
      const redeInicial = versaoRede;
      const atual = () => active.current && generation.current === tentativa;

      try {
        const rede = await NetInfo.fetch();
        if (!atual()) return;
        if (rede.isConnected !== true || rede.isInternetReachable === false) {
          falhasConfirmadas = 0;
          return;
        }

        const atividade = activity.current;
        const { data, error } = await supabase.rpc('touch_session', {
          p_id: lease.current,
          p_activity: new Date(atividade).toISOString(),
        });

        if (!atual()) return;
        const redeDepois = await NetInfo.fetch();
        if (!atual()) return;
        if (redeInicial !== versaoRede || redeDepois.isConnected !== true || redeDepois.isInternetReachable === false) {
          falhasConfirmadas = 0;
          return;
        }

        const codigo = error?.code ?? '';
        const invalida = (!error && data === false) ||
          ['PGRST301', 'PGRST303', '42501'].includes(codigo);

        if (invalida) {
          falhasConfirmadas++;
          console.warn('Validação negativa:', codigo || 'false', falhasConfirmadas);
          if (falhasConfirmadas >= 2) {
            await logout('Sessão inválida no servidor');
          }
          return;
        }

        falhasConfirmadas = 0;
        if (error) {
          console.warn('Validação temporariamente indisponível:', codigo);
          return;
        }
        if (data === true) lastSentActivity.current = atividade;
      } catch (error) {
        falhasConfirmadas = 0;
        if (atual()) console.warn('Não foi possível validar a sessão neste momento:', error);
      } finally {
        renewing.current = false;
      }
    };

    const timer = setInterval(() => { void validarSessao(); }, 10000);
    const unsubscribe = NetInfo.addEventListener((rede) => {
      versaoRede++;
      falhasConfirmadas = 0;
      if (rede.isConnected === true && rede.isInternetReachable !== false) {
        void validarSessao();
      }
    });

    return () => {
      appListener.remove();
      unsubscribe();
      clearInterval(timer);
    };
  }, [logout]);

  useEffect(() => {
    if (
      Platform.OS !== 'web' ||
      typeof document === 'undefined'
    ) {
      return;
    }

    const onActivity = () => touch();

    const onVisibility = () => {
      if (
        document.hidden &&
        active.current
      ) {
        void logout(
          'Aplicativo saiu do primeiro plano'
        );
      }
    };

    document.addEventListener(
      'pointerdown',
      onActivity
    );

    document.addEventListener(
      'keydown',
      onActivity
    );

    document.addEventListener(
      'visibilitychange',
      onVisibility
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        onActivity
      );

      document.removeEventListener(
        'keydown',
        onActivity
      );

      document.removeEventListener(
        'visibilitychange',
        onVisibility
      );
    };
  }, [touch, logout]);

  return (
    <SessionContext.Provider
      value={{
        user,
        busy,
        reason,
        login,
        logout,
        touch,
        enableNative,
      }}
    >
      <View
        style={{ flex: 1 }}
        onTouchStart={touch}
      >
        {children}
      </View>
    </SessionContext.Provider>
  );
}

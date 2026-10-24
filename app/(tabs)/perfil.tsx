
import { useAccessibility } from '@/src/contexts/AccessibilityProvider';
import { useSession } from '@/src/contexts/SessionProvider';
import { supabase } from '@/src/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type Profile = {
  id: string;
  name: string;
  role: string;
};

export default function PerfilScreen() {
  const { user, logout, touch, enableNative } = useSession();
  const { tema, tamanhoFonte } = useAccessibility();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingNotification, setTestingNotification] = useState(false);
  const [message, setMessage] = useState('');

  const [nativeEnabled, setNativeEnabled] = useState(false);
  const [loadingNative, setLoadingNative] = useState(false);

  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#171717' : '#f5f7f5',
    card: escuro ? '#252525' : '#ffffff',
    texto: escuro ? '#ffffff' : '#333333',
    secundario: escuro ? '#dddddd' : '#555555',
    titulo: escuro ? '#62d99b' : '#16834a',
    botao: escuro ? '#276749' : '#16834a',
    campo: escuro ? '#333333' : '#ffffff',
    leitura: escuro ? '#333333' : '#f0f0f0',
    borda: escuro ? '#888888' : '#aaaaaa',
    erro: escuro ? '#ff9aa9' : '#b00020',
  };

  // Carrega a preferência biométrica da conta conectada.
  useEffect(() => {
    let cancelled = false;

    setNativeEnabled(false);

    if (!user) {
      setLoadingNative(false);
      return;
    }

    const userId = user.id;

    async function loadNativePreference() {
      setLoadingNative(true);

      try {
        const enabled = await AsyncStorage.getItem(
          'native:' + userId
        );

        if (!cancelled) {
          setNativeEnabled(enabled === 'true');
        }
      } catch {
        if (!cancelled) {
          setNativeEnabled(false);
          setMessage(
            'Não foi possível carregar a preferência biométrica.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingNative(false);
        }
      }
    }

    void loadNativePreference();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Carrega os dados do perfil no Supabase.
  const loadProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, role')
      .eq('id', user.id)
      .single();

    if (error) {
      setMessage(
        'Não foi possível carregar o perfil: ' + error.message
      );
      setProfile(null);
    } else {
      setProfile(data);
      setName(data.name);
    }

    setLoading(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  // Atualiza o nome do usuário.
  async function saveName() {
    if (!user || !profile || saving) return;

    const newName = name.trim();

    if (!newName) {
      setMessage('O nome não pode ficar vazio.');
      return;
    }

    setSaving(true);
    setMessage('');
    touch();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ name: newName })
        .eq('id', user.id)
        .select('id, name, role')
        .single();

      if (error) {
        setMessage('Erro ao salvar: ' + error.message);
      } else {
        setProfile(data);
        setName(data.name);
        setMessage('Nome atualizado com sucesso!');
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? 'Erro ao salvar: ' + error.message
          : 'Não foi possível salvar o nome.'
      );
    } finally {
      setSaving(false);
    }
  }

  // Ativa ou desativa a autenticação biométrica.
  async function alterarBiometria() {
    if (!user || loadingNative) return;

    const novoEstado = !nativeEnabled;

    setLoadingNative(true);
    setMessage('');

    try {
      await enableNative(novoEstado);

      setNativeEnabled(novoEstado);

      setMessage(
        novoEstado
          ? 'Autenticação biométrica ativada com sucesso!'
          : 'Autenticação biométrica desativada com sucesso!'
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a autenticação biométrica.'
      );
    } finally {
      setLoadingNative(false);
    }
  }

  // Executa o teste de notificação.
  async function testarNotificacao() {
    if (testingNotification) return;

    touch();
    setTestingNotification(true);
    setMessage('');

    try {
      const { enviarNotificacaoTeste } = await import('@/src/services/notificacoes');
      await enviarNotificacaoTeste();
      setMessage('Notificação de teste agendada!');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível enviar a notificação.'
      );
    } finally {
      setTestingNotification(false);
    }
  }

  if (!user) return null;

  const mensagemSucesso =
    message.startsWith('Nome atualizado') ||
    message.startsWith('Notificação de teste agendada') ||
    message.startsWith('Autenticação biométrica ativada') ||
    message.startsWith('Autenticação biométrica desativada');

  return (
    <ScrollView
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[
          styles.card,
          { backgroundColor: cores.card },
        ]}
      >
        <Text
          style={[
            styles.title,
            {
              color: cores.titulo,
              fontSize: tamanhoFonte + 10,
            },
          ]}
        >
          Meu Perfil
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color={cores.titulo}
          />
        ) : (
          <>
            <Text
              style={[
                styles.label,
                {
                  color: cores.texto,
                  fontSize: tamanhoFonte,
                },
              ]}
            >
              Nome
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: cores.campo,
                  borderColor: cores.borda,
                  color: cores.texto,
                  fontSize: tamanhoFonte,
                },
              ]}
              value={name}
              onChangeText={(value) => {
                setName(value);
                touch();
              }}
              placeholder="Seu nome"
              placeholderTextColor={cores.secundario}
              accessibilityLabel="Nome do usuário"
            />

            <Text
              style={[
                styles.label,
                {
                  color: cores.texto,
                  fontSize: tamanhoFonte,
                },
              ]}
            >
              E-mail
            </Text>

            <Text
              selectable
              style={[
                styles.readOnly,
                {
                  backgroundColor: cores.leitura,
                  color: cores.secundario,
                  fontSize: tamanhoFonte,
                },
              ]}
            >
              {user.email ?? 'Não informado'}
            </Text>

            <Text
              style={[
                styles.label,
                {
                  color: cores.texto,
                  fontSize: tamanhoFonte,
                },
              ]}
            >
              Papel
            </Text>

            <Text
              style={[
                styles.readOnly,
                {
                  backgroundColor: cores.leitura,
                  color: cores.secundario,
                  fontSize: tamanhoFonte,
                },
              ]}
            >
              {profile?.role ?? 'Não disponível'}
            </Text>

            <Pressable
              style={[
                styles.saveButton,
                { backgroundColor: cores.botao },
                (saving || !profile) && styles.disabled,
              ]}
              onPress={() => void saveName()}
              disabled={saving || !profile}
              accessibilityRole="button"
              accessibilityLabel="Salvar nome"
            >
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: tamanhoFonte },
                ]}
              >
                {saving ? 'Salvando...' : 'Salvar nome'}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.notificationButton,
                { backgroundColor: cores.botao },
                testingNotification && styles.disabled,
              ]}
              onPress={() => void testarNotificacao()}
              disabled={testingNotification}
              accessibilityRole="button"
              accessibilityLabel="Testar notificação"
            >
              <Text
                style={[
                  styles.buttonText,
                  { fontSize: tamanhoFonte },
                ]}
              >
                {testingNotification
                  ? 'Enviando...'
                  : 'Testar notificação'}
              </Text>
            </Pressable>
          </>
        )}

        <Pressable
          style={[
            styles.saveButton,
            { backgroundColor: cores.botao },
            (loadingNative || loading) && styles.disabled,
          ]}
          onPress={() => void alterarBiometria()}
          disabled={loadingNative || loading}
          accessibilityRole="button"
          accessibilityLabel={
            nativeEnabled
              ? 'Desativar autenticação biométrica'
              : 'Ativar autenticação biométrica'
          }
        >
          <Text
            style={[
              styles.buttonText,
              { fontSize: tamanhoFonte },
            ]}
          >
            {loadingNative
              ? 'Aguarde...'
              : nativeEnabled
                ? 'Desativar biometria'
                : 'Ativar biometria'}
          </Text>
        </Pressable>

        {message ? (
          <Text
            style={[
              styles.message,
              {
                fontSize: tamanhoFonte,
                color: mensagemSucesso
                  ? cores.titulo
                  : cores.erro,
              },
            ]}
            accessibilityRole="alert"
          >
            {message}
          </Text>
        ) : null}

        <Pressable
          style={[
            styles.logoutButton,
            { borderColor: cores.erro },
          ]}
          onPress={() =>
            void logout('Você saiu da sua conta')
          }
          accessibilityRole="button"
          accessibilityLabel="Sair da conta"
        >
          <Text
            style={[
              styles.logoutText,
              {
                color: cores.erro,
                fontSize: tamanhoFonte,
              },
            ]}
          >
            Sair da conta
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },

  card: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
  },

  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },

  label: {
    fontWeight: '600',
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },

  readOnly: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },

  message: {
    textAlign: 'center',
    marginBottom: 15,
  },

  saveButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 14,
  },

  notificationButton: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginBottom: 14,
  },

  disabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  logoutButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },

  logoutText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

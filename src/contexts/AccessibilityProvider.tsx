
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Platform } from 'react-native';

const CHAVE_FONTE = 'menorpreco-tamanho-fonte';
const CHAVE_TEMA = 'menorpreco-tema';
const CHAVE_SOM = 'menorpreco-som-confirmacao';

export type Tema = 'claro' | 'escuro';

type AccessibilityContextType = {
  tamanhoFonte: number;
  tema: Tema;
  somAtivado: boolean;
  pronto: boolean;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
  alterarTema: (tema: Tema) => void;
  alterarSom: (ativado: boolean) => void;
};

const AccessibilityContext =
  createContext<AccessibilityContextType | undefined>(undefined);

async function lerPreferencia(
  chave: string
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return window.localStorage.getItem(chave);
  }

  return AsyncStorage.getItem(chave);
}

async function salvarPreferencia(
  chave: string,
  valor: string
): Promise<void> {
  if (Platform.OS === 'web') {
    window.localStorage.setItem(chave, valor);
    return;
  }

  await AsyncStorage.setItem(chave, valor);
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tamanhoFonte, setTamanhoFonte] = useState(16);
  const [tema, setTema] = useState<Tema>('claro');
  const [somAtivado, setSomAtivado] = useState(true);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarPreferencias() {
      try {
        const [fonteSalva, temaSalvo, somSalvo] =
          await Promise.all([
            lerPreferencia(CHAVE_FONTE),
            lerPreferencia(CHAVE_TEMA),
            lerPreferencia(CHAVE_SOM),
          ]);

        if (!ativo) return;

        if (fonteSalva !== null) {
          const valor = Number(fonteSalva);

          if (
            Number.isFinite(valor) &&
            valor >= 14 &&
            valor <= 26
          ) {
            setTamanhoFonte(valor);
          }
        }

        if (temaSalvo === 'claro' || temaSalvo === 'escuro') {
          setTema(temaSalvo);
        }

        if (somSalvo === 'true' || somSalvo === 'false') {
          setSomAtivado(somSalvo === 'true');
        }
      } catch (erro) {
        console.error(
          'Erro ao carregar preferências globais:',
          erro
        );
      } finally {
        if (ativo) {
          setPronto(true);
        }
      }
    }

    carregarPreferencias();

    return () => {
      ativo = false;
    };
  }, []);

  useEffect(() => {
    if (!pronto) return;

    async function persistirPreferencias() {
      try {
        await Promise.all([
          salvarPreferencia(CHAVE_FONTE, String(tamanhoFonte)),
          salvarPreferencia(CHAVE_TEMA, tema),
          salvarPreferencia(CHAVE_SOM, String(somAtivado)),
        ]);
      } catch (erro) {
        console.error(
          'Erro ao salvar preferências globais:',
          erro
        );
      }
    }

    persistirPreferencias();
  }, [tamanhoFonte, tema, somAtivado, pronto]);

  function aumentarFonte() {
    setTamanhoFonte((atual) => Math.min(atual + 2, 26));
  }

  function diminuirFonte() {
    setTamanhoFonte((atual) => Math.max(atual - 2, 14));
  }

  function alterarTema(novoTema: Tema) {
    setTema(novoTema);
  }

  function alterarSom(ativado: boolean) {
    setSomAtivado(ativado);
  }

  return (
    <AccessibilityContext.Provider
      value={{
        tamanhoFonte,
        tema,
        somAtivado,
        pronto,
        aumentarFonte,
        diminuirFonte,
        alterarTema,
        alterarSom,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const contexto = useContext(AccessibilityContext);

  if (!contexto) {
    throw new Error(
      'useAccessibility deve ser utilizado dentro do AccessibilityProvider'
    );
  }

  return contexto;
}

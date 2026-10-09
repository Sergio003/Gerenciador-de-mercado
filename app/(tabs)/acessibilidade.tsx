
import React, { useEffect, useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

const CHAVE_FONTE = 'menorpreco-tamanho-fonte';
const CHAVE_TEMA = 'menorpreco-tema';

type Tema = 'claro' | 'escuro';

function carregarTamanhoFonte(): number {
  try {
    if (typeof window !== 'undefined') {
      const valor = window.localStorage.getItem(CHAVE_FONTE);
      const tamanho = Number(valor);

      if (
        valor !== null &&
        Number.isFinite(tamanho) &&
        tamanho >= 14 &&
        tamanho <= 26
      ) {
        return tamanho;
      }
    }
  } catch (erro) {
    console.error('Erro ao carregar fonte:', erro);
  }

  return 16;
}

function carregarTema(): Tema {
  try {
    if (typeof window !== 'undefined') {
      const valor = window.localStorage.getItem(CHAVE_TEMA);

      if (valor === 'claro' || valor === 'escuro') {
        return valor;
      }
    }
  } catch (erro) {
    console.error('Erro ao carregar tema:', erro);
  }

  return 'claro';
}

export default function AcessibilidadeScreen() {
  const [tamanhoFonte, setTamanhoFonte] = useState(
    carregarTamanhoFonte
  );

  const [tema, setTema] = useState<Tema>(carregarTema);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    setTamanhoFonte(carregarTamanhoFonte());
    setTema(carregarTema());
    setPronto(true);
  }, []);

  useEffect(() => {
    if (!pronto) return;

    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          CHAVE_FONTE,
          String(tamanhoFonte)
        );

        window.localStorage.setItem(CHAVE_TEMA, tema);
      }
    } catch (erro) {
      console.error('Erro ao salvar preferências:', erro);
    }
  }, [tamanhoFonte, tema, pronto]);

  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#171717' : '#f5f7f5',
    texto: escuro ? '#ffffff' : '#333333',
    titulo: escuro ? '#62d99b' : '#16834a',
    botao: escuro ? '#276749' : '#16834a',
    borda: escuro ? '#888888' : '#cccccc',
  };

  function aumentarFonte() {
    setTamanhoFonte((atual) => Math.min(atual + 2, 26));
  }

  function diminuirFonte() {
    setTamanhoFonte((atual) => Math.max(atual - 2, 14));
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
    >
      <Text style={[styles.titulo, { color: cores.titulo }]}>
        Configurações de Acessibilidade
      </Text>

      <Text style={[styles.subtitulo, { color: cores.texto }]}>
        Ajuste do tamanho da fonte
      </Text>

      <View style={styles.botoes}>
        <Pressable
          style={[styles.botao, { backgroundColor: cores.botao }]}
          onPress={diminuirFonte}
          accessibilityRole="button"
          accessibilityLabel="Diminuir tamanho da fonte"
        >
          <Text style={styles.textoBotao}>A−</Text>
        </Pressable>

        <Pressable
          style={[styles.botao, { backgroundColor: cores.botao }]}
          onPress={aumentarFonte}
          accessibilityRole="button"
          accessibilityLabel="Aumentar tamanho da fonte"
        >
          <Text style={styles.textoBotao}>A+</Text>
        </Pressable>
      </View>

      <Text style={[styles.indicador, { color: cores.texto }]}>
        Tamanho selecionado: {pronto ? tamanhoFonte : 'Carregando...'}
      </Text>

      <Text style={[styles.subtitulo, { color: cores.texto }]}>
        Aparência do aplicativo
      </Text>

      <View style={styles.botoes}>
        <Pressable
          style={[
            styles.botaoTema,
            {
              backgroundColor: cores.botao,
              borderColor: tema === 'claro' ? cores.titulo : cores.borda,
              borderWidth: tema === 'claro' ? 3 : 1,
            },
          ]}
          onPress={() => setTema('claro')}
          accessibilityRole="button"
          accessibilityLabel="Ativar modo claro"
          accessibilityState={{ selected: tema === 'claro' }}
        >
          <Text style={styles.textoBotao}>☀ Claro</Text>
        </Pressable>

        <Pressable
          style={[
            styles.botaoTema,
            {
              backgroundColor: cores.botao,
              borderColor: tema === 'escuro' ? cores.titulo : cores.borda,
              borderWidth: tema === 'escuro' ? 3 : 1,
            },
          ]}
          onPress={() => setTema('escuro')}
          accessibilityRole="button"
          accessibilityLabel="Ativar modo escuro"
          accessibilityState={{ selected: tema === 'escuro' }}
        >
          <Text style={styles.textoBotao}>☾ Escuro</Text>
        </Pressable>
      </View>

      <Text style={[styles.indicador, { color: cores.texto }]}>
        Tema selecionado: {tema}
      </Text>

      {pronto && (
        <Text
          style={[
            styles.exemplo,
            {
              fontSize: tamanhoFonte,
              color: cores.texto,
            },
          ]}
        >
          Menor Preço Saqua: encontre produtos
          e compare preços nos mercados da região.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  subtitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  botoes: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  botao: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  botaoTema: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  indicador: {
    fontSize: 14,
    marginBottom: 20,
  },
  exemplo: {
    lineHeight: 36,
  },
});

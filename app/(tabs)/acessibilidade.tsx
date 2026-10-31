
import { useAccessibility } from '@/src/contexts/AccessibilityProvider';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function AcessibilidadeScreen() {
  const {
    tamanhoFonte,
    tema,
    somAtivado,
    pronto,
    aumentarFonte,
    diminuirFonte,
    alterarTema,
    alterarSom,
  } = useAccessibility();

  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#171717' : '#f5f7f5',
    texto: escuro ? '#ffffff' : '#333333',
    titulo: escuro ? '#62d99b' : '#16834a',
    botao: escuro ? '#276749' : '#16834a',
    borda: escuro ? '#888888' : '#cccccc',
  };

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={styles.container}
    >
      {/* Título principal */}
      <Text
        style={[
          styles.titulo,
          {
            color: cores.titulo,
            fontSize: tamanhoFonte + 8,
          },
        ]}
        accessibilityRole="header"
      >
        Configurações de Acessibilidade
      </Text>

      <Text
        style={[
          styles.subtitulo,
          {
            color: cores.texto,
            fontSize: tamanhoFonte + 2,
          },
        ]}
        accessibilityRole="header"
      >
        Ajuste do tamanho da fonte
      </Text>

      <View style={styles.botoes}>
        <Pressable
          style={[
            styles.botao,
            { backgroundColor: cores.botao },
          ]}
          onPress={diminuirFonte}
          disabled={!pronto || tamanhoFonte <= 14}
          accessibilityRole="button"
          accessibilityLabel="Diminuir tamanho da fonte"
          accessibilityState={{
            disabled: !pronto || tamanhoFonte <= 14,
          }}
        >
          <Text style={styles.textoBotao}>A−</Text>
        </Pressable>

        <Pressable
          style={[
            styles.botao,
            { backgroundColor: cores.botao },
          ]}
          onPress={aumentarFonte}
          disabled={!pronto || tamanhoFonte >= 26}
          accessibilityRole="button"
          accessibilityLabel="Aumentar tamanho da fonte"
          accessibilityState={{
            disabled: !pronto || tamanhoFonte >= 26,
          }}
        >
          <Text style={styles.textoBotao}>A+</Text>
        </Pressable>
      </View>

      <Text
        style={[
          styles.indicador,
          {
            color: cores.texto,
            fontSize: tamanhoFonte,
          },
        ]}
      >
        Tamanho selecionado:{' '}
        {pronto ? tamanhoFonte : 'Carregando...'}
      </Text>

      <Text
        style={[
          styles.subtitulo,
          {
            color: cores.texto,
            fontSize: tamanhoFonte + 2,
          },
        ]}
        accessibilityRole="header"
      >
        Aparência do aplicativo
      </Text>

      <View style={styles.botoes}>
        <Pressable
          style={[
            styles.botaoTema,
            {
              backgroundColor: cores.botao,
              borderColor:
                tema === 'claro'
                  ? cores.titulo
                  : cores.borda,
              borderWidth: tema === 'claro' ? 3 : 1,
            },
          ]}
          onPress={() => alterarTema('claro')}
          disabled={!pronto}
          accessibilityRole="button"
          accessibilityLabel="Ativar modo claro"
          accessibilityState={{
            selected: tema === 'claro',
            disabled: !pronto,
          }}
        >
          <Text style={styles.textoBotao}>
            ☀ Claro
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.botaoTema,
            {
              backgroundColor: cores.botao,
              borderColor:
                tema === 'escuro'
                  ? cores.titulo
                  : cores.borda,
              borderWidth: tema === 'escuro' ? 3 : 1,
            },
          ]}
          onPress={() => alterarTema('escuro')}
          disabled={!pronto}
          accessibilityRole="button"
          accessibilityLabel="Ativar modo escuro"
          accessibilityState={{
            selected: tema === 'escuro',
            disabled: !pronto,
          }}
        >
          <Text style={styles.textoBotao}>
            ☾ Escuro
          </Text>
        </Pressable>
      </View>

      <Text
        style={[
          styles.indicador,
          {
            color: cores.texto,
            fontSize: tamanhoFonte,
          },
        ]}
      >
        Tema selecionado:{' '}
        {pronto ? tema : 'Carregando...'}
      </Text>

      <Text
        style={[
          styles.subtitulo,
          {
            color: cores.texto,
            fontSize: tamanhoFonte + 2,
          },
        ]}
        accessibilityRole="header"
      >
        Som de confirmação
      </Text>

      <Text
        style={[
          styles.indicador,
          {
            color: cores.texto,
            fontSize: tamanhoFonte,
          },
        ]}
      >
        Reproduzir um som quando um produto for
        cadastrado com sucesso.
      </Text>

      <View style={styles.botoes}>
        <Pressable
          style={[
            styles.botaoTema,
            {
              backgroundColor: cores.botao,
              borderColor: somAtivado
                ? cores.titulo
                : cores.borda,
              borderWidth: somAtivado ? 3 : 1,
            },
          ]}
          onPress={() => alterarSom(true)}
          disabled={!pronto}
          accessibilityRole="button"
          accessibilityLabel="Ativar som de confirmação"
          accessibilityState={{
            selected: somAtivado,
            disabled: !pronto,
          }}
        >
          <Text style={styles.textoBotao}>
            Ativar som
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.botaoTema,
            {
              backgroundColor: cores.botao,
              borderColor: !somAtivado
                ? cores.titulo
                : cores.borda,
              borderWidth: !somAtivado ? 3 : 1,
            },
          ]}
          onPress={() => alterarSom(false)}
          disabled={!pronto}
          accessibilityRole="button"
          accessibilityLabel="Desativar som de confirmação"
          accessibilityState={{
            selected: !somAtivado,
            disabled: !pronto,
          }}
        >
          <Text style={styles.textoBotao}>
            Silenciar
          </Text>
        </Pressable>
      </View>

      <Text
        style={[
          styles.indicador,
          {
            color: cores.texto,
            fontSize: tamanhoFonte,
          },
        ]}
        accessibilityLiveRegion="polite"
      >
        Som de confirmação:{' '}
        {!pronto
          ? 'Carregando...'
          : somAtivado
            ? 'Ativado'
            : 'Desativado'}
      </Text>

      {pronto && (
        <Text
          style={[
            styles.exemplo,
            {
              fontSize: tamanhoFonte,
              color: cores.texto,
              lineHeight: tamanhoFonte * 1.5,
            },
          ]}
        >
          Menor Preço Saqua: encontre produtos e
          compare preços nos mercados da região.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },

  titulo: {
    fontWeight: 'bold',
    marginBottom: 24,
  },

  subtitulo: {
    fontWeight: 'bold',
    marginBottom: 16,
  },

  botoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
    marginBottom: 20,
  },

  exemplo: {
    marginTop: 8,
  },
});

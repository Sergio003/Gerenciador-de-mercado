
import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import type { Tema } from '../services/acessibilidade';

type Produto = {
  id: string;
  nome: string;
  preco: string;
  endereco: string;
};

type ProdutoItemProps = {
  item: Produto;
  onEditar: (item: Produto) => void;
  onRemover: (id: string) => void;
  tema?: Tema;
  tamanhoFonte?: number;
};

export default function ProdutoItem({
  item,
  onEditar,
  onRemover,
  tema = 'claro',
  tamanhoFonte = 16,
}: ProdutoItemProps) {
  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#252525' : '#FFFFFF',
    borda: escuro ? '#62D99B' : '#198754',
    texto: escuro ? '#FFFFFF' : '#333333',
    preco: escuro ? '#86EFAC' : '#198754',
    endereco: escuro ? '#D1D5DB' : '#555555',
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: cores.fundo,
          borderColor: cores.borda,
        },
      ]}
    >
      <View style={styles.informacoes}>
        <Text
          style={[
            styles.nome,
            {
              color: cores.texto,
              fontSize: tamanhoFonte,
            },
          ]}
        >
          {item.nome}
        </Text>

        <Text
          style={[
            styles.preco,
            {
              color: cores.preco,
              fontSize: tamanhoFonte,
            },
          ]}
        >
          R$ {item.preco}
        </Text>

        <Text
          style={[
            styles.endereco,
            {
              color: cores.endereco,
              fontSize: tamanhoFonte,
            },
          ]}
        >
          📍 {item.endereco}
        </Text>
      </View>

      <View style={styles.botoes}>
        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => onEditar(item)}
          accessibilityRole="button"
          accessibilityLabel={`Editar produto ${item.nome}`}
          accessibilityHint="Abre o formulário para alterar o produto"
        >
          <Text
            style={[
              styles.textoBotao,
              { fontSize: tamanhoFonte },
            ]}
          >
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoRemover}
          onPress={() => onRemover(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Remover produto ${item.nome}`}
          accessibilityHint="Exclui o produto cadastrado"
        >
          <Text
            style={[
              styles.textoBotao,
              { fontSize: tamanhoFonte },
            ]}
          >
            Remover
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#198754',
    gap: 10,
  },

  informacoes: {
    flex: 1,
    minWidth: 150,
    marginRight: 10,
  },

  nome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },

  preco: {
    fontSize: 15,
    color: '#198754',
    marginTop: 4,
  },

  endereco: {
    fontSize: 13,
    color: '#555555',
    marginTop: 6,
  },

  botoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },

  botaoEditar: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  botaoRemover: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

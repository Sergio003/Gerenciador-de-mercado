import React from 'react';

import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

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
};

export default function ProdutoItem({
  item,
  onEditar,
  onRemover,
}: ProdutoItemProps) {
  return (
    <View style={styles.container}>

      <View style={styles.informacoes}>

        <Text style={styles.nome}>
          {item.nome}
        </Text>

        <Text style={styles.preco}>
          R$ {item.preco}
        </Text>

        <Text style={styles.endereco}>
          📍 {item.endereco}
        </Text>

      </View>

      <View style={styles.botoes}>

        <TouchableOpacity
          style={styles.botaoEditar}
          onPress={() => onEditar(item)}
        >
          <Text style={styles.textoBotao}>
            Editar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.botaoRemover}
          onPress={() => onRemover(item.id)}
        >
          <Text style={styles.textoBotao}>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#198754',
  },

  informacoes: {
    flex: 1,
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
  },
});
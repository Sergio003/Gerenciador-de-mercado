import React, { useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import ProdutoItem from '../components/ProdutoItem';

import {
  buscarCep,
  Endereco,
} from '../services/viacep';

type Produto = {
  id: string;
  nome: string;
  preco: string;
  endereco: string;
};

export default function CadastroProdutoScreen() {

  const [produto, setProduto] = useState('');
  const [preco, setPreco] = useState('');
  const [cep, setCep] = useState('');

  const [produtos, setProdutos] = useState<Produto[]>([]);

  const [endereco, setEndereco] =
    useState<Endereco | null>(null);

  const [carregando, setCarregando] =
    useState(false);

  const [erro, setErro] = useState('');

  async function consultarCep() {

    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setErro('Digite um CEP válido com 8 números.');
      setEndereco(null);
      return;
    }

    try {

      setCarregando(true);
      setErro('');
      setEndereco(null);

      const dados = await buscarCep(cepLimpo);

      setEndereco(dados);

    } catch (erro) {

      setErro(
        'Não foi possível localizar esse CEP.'
      );

      setEndereco(null);

    } finally {

      setCarregando(false);

    }
  }

  function adicionarProduto() {

    const produtoTratado = produto.trim();
    const precoTratado = preco.trim();

    if (
      produtoTratado === '' ||
      precoTratado === ''
    ) {
      setErro(
        'Atenção! Preencha o nome do produto e o preço.'
      );
      return;
    }

    if (!endereco) {
      setErro(
        'Consulte o CEP do mercado antes de cadastrar o produto.'
      );
      return;
    }

    const enderecoCompleto =
      `${endereco.logradouro || 'Endereço'} - ` +
      `${endereco.bairro || 'Bairro não informado'}, ` +
      `${endereco.localidade}/${endereco.uf}`;

    const novoProduto: Produto = {
      id: Date.now().toString(),
      nome: produtoTratado,
      preco: precoTratado,
      endereco: enderecoCompleto,
    };

    setProdutos((listaAtual) => [
      ...listaAtual,
      novoProduto,
    ]);

    setProduto('');
    setPreco('');
    setCep('');
    setEndereco(null);
    setErro('');
  }

  function removerProduto(id: string) {

    setProdutos((listaAtual) =>
      listaAtual.filter(
        (item) => item.id !== id
      )
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.logo}>
        🛒
      </Text>

      <Text style={styles.titulo}>
        Menor Preço Saqua
      </Text>

      <Text style={styles.subtitulo}>
        Cadastre produtos, preços e o local
        onde a oferta foi encontrada.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        value={produto}
        onChangeText={(texto) => {
          setProduto(texto);
          setErro('');
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Preço encontrado"
        value={preco}
        onChangeText={(texto) => {
          setPreco(texto);
          setErro('');
        }}
        keyboardType="decimal-pad"
      />

      <Text style={styles.tituloCep}>
        Localização do mercado
      </Text>

      <TextInput
        style={styles.input}
        placeholder="CEP do mercado"
        value={cep}
        onChangeText={(texto) => {
          setCep(texto);
          setEndereco(null);
          setErro('');
        }}
        keyboardType="numeric"
        maxLength={9}
      />

      <TouchableOpacity
        style={styles.botaoCep}
        onPress={consultarCep}
      >
        <Text style={styles.textoBotao}>
          BUSCAR ENDEREÇO
        </Text>
      </TouchableOpacity>

      {carregando && (
        <View style={styles.loading}>
          <ActivityIndicator size="small" />

          <Text style={styles.textoLoading}>
            Buscando endereço...
          </Text>
        </View>
      )}

      {erro !== '' && (
        <Text style={styles.erro}>
          {erro}
        </Text>
      )}

      {endereco && (
        <View style={styles.caixaEndereco}>

          <Text style={styles.enderecoTitulo}>
            📍 Endereço encontrado
          </Text>

          <Text style={styles.enderecoTexto}>
            {endereco.logradouro ||
              'Logradouro não informado'}
          </Text>

          <Text style={styles.enderecoTexto}>
            {endereco.bairro ||
              'Bairro não informado'}
          </Text>

          <Text style={styles.enderecoTexto}>
            {endereco.localidade} - {endereco.uf}
          </Text>

          <Text style={styles.enderecoTexto}>
            CEP: {endereco.cep}
          </Text>

        </View>
      )}

      <TouchableOpacity
        style={styles.botao}
        onPress={adicionarProduto}
      >
        <Text style={styles.textoBotao}>
          ADICIONAR PRODUTO
        </Text>
      </TouchableOpacity>

      <Text style={styles.contador}>
        Total cadastrado: {produtos.length}
      </Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProdutoItem
            item={item}
            onRemover={removerProduto}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.listaVazia}>
            Nenhum produto cadastrado.
          </Text>
        }
      />

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 35,
    backgroundColor: '#F4F8F4',
  },

  logo: {
    fontSize: 40,
    textAlign: 'center',
  },

  titulo: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#198754',
    textAlign: 'center',
  },

  subtitulo: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 18,
  },

  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#198754',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 10,
  },

  tituloCep: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 7,
  },

  botaoCep: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },

  botao: {
    backgroundColor: '#198754',
    padding: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },

  textoLoading: {
    marginLeft: 8,
    color: '#555555',
  },

  erro: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 8,
  },

  caixaEndereco: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#198754',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
  },

  enderecoTitulo: {
    fontWeight: 'bold',
    color: '#198754',
    marginBottom: 5,
  },

  enderecoTexto: {
    color: '#374151',
    fontSize: 14,
  },

  contador: {
    fontSize: 15,
    color: '#374151',
    marginVertical: 12,
    fontWeight: 'bold',
  },

  listaVazia: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 20,
  },
});
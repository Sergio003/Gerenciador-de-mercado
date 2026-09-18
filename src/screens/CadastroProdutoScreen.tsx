import React, { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  FlatList,
  Platform,
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

const CHAVE_STORAGE = 'menor-preco-saqua-produtos';

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
  const [sucesso, setSucesso] = useState('');

  const [produtoEditando, setProdutoEditando] =
    useState<string | null>(null);

  // AULA 6 - Recuperação automática dos dados
  useEffect(() => {
    carregarProdutos();
  }, []);

  function carregarProdutos() {
    try {
      if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined'
      ) {
        const dadosSalvos =
          localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos) {
          const lista = JSON.parse(dadosSalvos);

          if (Array.isArray(lista)) {
            setProdutos(lista);
          }
        }
      }
    } catch (error) {
      setErro(
        'Não foi possível recuperar os produtos salvos.'
      );
    }
  }

  // AULA 6 - Persistência no localStorage
  function salvarProdutos(lista: Produto[]) {
    try {
      if (
        Platform.OS === 'web' &&
        typeof window !== 'undefined'
      ) {
        localStorage.setItem(
          CHAVE_STORAGE,
          JSON.stringify(lista)
        );
      }

      setProdutos(lista);

    } catch (error) {
      setErro(
        'Não foi possível salvar os dados.'
      );
    }
  }

  async function consultarCep() {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setErro(
        'Digite um CEP válido com 8 números.'
      );
      setSucesso('');
      setEndereco(null);
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      setSucesso('');
      setEndereco(null);

      const dados = await buscarCep(cepLimpo);

      setEndereco(dados);
      setSucesso('Endereço encontrado com sucesso!');

    } catch (error) {
      setErro(
        'Não foi possível localizar esse CEP.'
      );

      setSucesso('');
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
      setSucesso('');
      return;
    }

    if (!endereco) {
      setErro(
        'Consulte o CEP do mercado antes de cadastrar o produto.'
      );
      setSucesso('');
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

    const novaLista = [
      ...produtos,
      novoProduto,
    ];

    salvarProdutos(novaLista);

    limparFormulario();

    setErro('');
    setSucesso(
      'Produto cadastrado com sucesso!'
    );
  }

  function removerProduto(id: string) {
    try {
      const novaLista = produtos.filter(
        (item) => item.id !== id
      );

      salvarProdutos(novaLista);

      if (produtoEditando === id) {
        cancelarEdicao();
      }

      setErro('');
      setSucesso(
        'Produto removido com sucesso!'
      );

    } catch (error) {
      setErro(
        'Não foi possível remover o produto.'
      );
      setSucesso('');
    }
  }

  function editarProduto(item: Produto) {
    setProduto(item.nome);
    setPreco(item.preco);

    setProdutoEditando(item.id);

    setEndereco(null);
    setCep('');

    setErro('');
    setSucesso(
      'Edite o nome ou o preço e clique em SALVAR ALTERAÇÕES.'
    );
  }

  function salvarEdicao() {
    const produtoTratado = produto.trim();
    const precoTratado = preco.trim();

    if (
      produtoTratado === '' ||
      precoTratado === ''
    ) {
      setErro(
        'Preencha o nome e o preço do produto.'
      );
      setSucesso('');
      return;
    }

    try {
      const novaLista = produtos.map(
        (item) => {
          if (item.id === produtoEditando) {
            return {
              ...item,
              nome: produtoTratado,
              preco: precoTratado,
            };
          }

          return item;
        }
      );

      salvarProdutos(novaLista);

      limparFormulario();

      setProdutoEditando(null);

      setErro('');
      setSucesso(
        'Produto atualizado com sucesso!'
      );

    } catch (error) {
      setErro(
        'Não foi possível atualizar o produto.'
      );
      setSucesso('');
    }
  }

  function cancelarEdicao() {
    limparFormulario();

    setProdutoEditando(null);
    setErro('');
    setSucesso('');
  }

  function limparFormulario() {
    setProduto('');
    setPreco('');
    setCep('');
    setEndereco(null);
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

      {produtoEditando && (
        <View style={styles.caixaEdicao}>
          <Text style={styles.textoEdicao}>
            ✏️ Editando produto
          </Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        placeholder="Nome do produto"
        value={produto}
        onChangeText={(texto) => {
          setProduto(texto);
          setErro('');
          setSucesso('');
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Preço encontrado"
        value={preco}
        onChangeText={(texto) => {
          setPreco(texto);
          setErro('');
          setSucesso('');
        }}
        keyboardType="decimal-pad"
      />

      {!produtoEditando && (
        <>
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
              setSucesso('');
            }}
            keyboardType="numeric"
            maxLength={9}
          />

          <TouchableOpacity
            style={styles.botaoCep}
            onPress={consultarCep}
            disabled={carregando}
          >
            <Text style={styles.textoBotao}>
              {carregando
                ? 'BUSCANDO...'
                : 'BUSCAR ENDEREÇO'}
            </Text>
          </TouchableOpacity>
        </>
      )}

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
          ❌ {erro}
        </Text>
      )}

      {sucesso !== '' && (
        <Text style={styles.sucesso}>
          ✅ {sucesso}
        </Text>
      )}

      {endereco && !produtoEditando && (
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

      {produtoEditando ? (
        <>
          <TouchableOpacity
            style={styles.botao}
            onPress={salvarEdicao}
          >
            <Text style={styles.textoBotao}>
              SALVAR ALTERAÇÕES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={cancelarEdicao}
          >
            <Text style={styles.textoBotao}>
              CANCELAR EDIÇÃO
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.botao}
          onPress={adicionarProduto}
        >
          <Text style={styles.textoBotao}>
            ADICIONAR PRODUTO
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.contador}>
        Total cadastrado: {produtos.length}
      </Text>

      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProdutoItem
            item={item}
            onEditar={editarProduto}
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

  botaoCancelar: {
    backgroundColor: '#6B7280',
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

  sucesso: {
    color: '#198754',
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

  caixaEdicao: {
    backgroundColor: '#FFF7D6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },

  textoEdicao: {
    color: '#92400E',
    fontWeight: 'bold',
    textAlign: 'center',
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
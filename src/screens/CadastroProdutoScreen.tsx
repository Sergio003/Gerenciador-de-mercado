
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
  carregarTamanhoFonte,
  carregarTema,
  type Tema,
} from '../services/acessibilidade';
import {
  atualizarProduto,
  cadastrarProduto,
  excluirProduto,
  listarProdutos,
} from '../services/produtosApi';
import { buscarCep, type Endereco } from '../services/viacep';

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
  const [endereco, setEndereco] = useState<Endereco | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [produtoEditando, setProdutoEditando] = useState<string | null>(null);

  // P2 - Preferências de acessibilidade
  const [tema, setTema] = useState<Tema>(carregarTema);
  const [tamanhoFonte, setTamanhoFonte] = useState(carregarTamanhoFonte);
  const [preferenciasProntas, setPreferenciasProntas] = useState(false);

  useEffect(() => {
    setTema(carregarTema());
    setTamanhoFonte(carregarTamanhoFonte());
    setPreferenciasProntas(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setTema(carregarTema());
      setTamanhoFonte(carregarTamanhoFonte());
    }, [])
  );

  // P1 - Carrega produtos locais e sincroniza com a API
  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    try {
      setCarregando(true);
      setErro('');

      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const dadosSalvos = localStorage.getItem(CHAVE_STORAGE);

        if (dadosSalvos) {
          const listaLocal = JSON.parse(dadosSalvos);

          if (Array.isArray(listaLocal)) {
            setProdutos(listaLocal);
          }
        }
      }

      const dadosApi = await listarProdutos();

      const listaApi: Produto[] = dadosApi.map((item) => ({
        id: item._id,
        nome: item.nome,
        preco: item.preco,
        endereco: item.endereco,
      }));

      salvarLocalmente(listaApi);
    } catch (error) {
      setErro(
        'Não foi possível carregar os produtos do servidor. Os dados locais serão mantidos.'
      );
    } finally {
      setCarregando(false);
    }
  }

  function salvarLocalmente(lista: Produto[]) {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
      }

      setProdutos(lista);
    } catch (error) {
      setErro('Não foi possível salvar os dados localmente.');
    }
  }

  async function consultarCep() {
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      setErro('Digite um CEP válido com 8 números.');
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
      setErro('Não foi possível localizar esse CEP.');
      setSucesso('');
      setEndereco(null);
    } finally {
      setCarregando(false);
    }
  }

  async function adicionarProduto() {
    const produtoTratado = produto.trim();
    const precoTratado = preco.trim();

    if (produtoTratado === '' || precoTratado === '') {
      setErro('Atenção! Preencha o nome do produto e o preço.');
      setSucesso('');
      return;
    }

    if (!endereco) {
      setErro('Consulte o CEP do mercado antes de cadastrar o produto.');
      setSucesso('');
      return;
    }

    const enderecoCompleto =
      `${endereco.logradouro || 'Endereço'} - ` +
      `${endereco.bairro || 'Bairro não informado'}, ` +
      `${endereco.localidade}/${endereco.uf}`;

    try {
      setCarregando(true);
      setErro('');
      setSucesso('');

      const produtoCriado = await cadastrarProduto(
        produtoTratado,
        precoTratado,
        enderecoCompleto
      );

      const novoProduto: Produto = {
        id: produtoCriado._id,
        nome: produtoCriado.nome,
        preco: produtoCriado.preco,
        endereco: produtoCriado.endereco,
      };

      salvarLocalmente([...produtos, novoProduto]);
      limparFormulario();
      setSucesso('Produto cadastrado com sucesso!');
    } catch (error) {
      setErro('Não foi possível cadastrar o produto no servidor.');
      setSucesso('');
    } finally {
      setCarregando(false);
    }
  }

  async function removerProduto(id: string) {
    try {
      setCarregando(true);
      setErro('');
      setSucesso('');

      await excluirProduto(id);

      const novaLista = produtos.filter((item) => item.id !== id);
      salvarLocalmente(novaLista);

      if (produtoEditando === id) {
        cancelarEdicao();
      }

      setSucesso('Produto removido com sucesso!');
    } catch (error) {
      setErro('Não foi possível remover o produto.');
      setSucesso('');
    } finally {
      setCarregando(false);
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

  async function salvarEdicao() {
    const produtoTratado = produto.trim();
    const precoTratado = preco.trim();

    if (produtoTratado === '' || precoTratado === '') {
      setErro('Preencha o nome e o preço do produto.');
      setSucesso('');
      return;
    }

    if (!produtoEditando) {
      return;
    }

    const produtoAtual = produtos.find(
      (item) => item.id === produtoEditando
    );

    if (!produtoAtual) {
      setErro('Produto não encontrado.');
      return;
    }

    try {
      setCarregando(true);
      setErro('');
      setSucesso('');

      const produtoAtualizado = await atualizarProduto(
        produtoEditando,
        produtoTratado,
        precoTratado,
        produtoAtual.endereco
      );

      const novaLista = produtos.map((item) => {
        if (item.id === produtoEditando) {
          return {
            id: produtoAtualizado._id,
            nome: produtoAtualizado.nome,
            preco: produtoAtualizado.preco,
            endereco: produtoAtualizado.endereco,
          };
        }

        return item;
      });

      salvarLocalmente(novaLista);
      limparFormulario();
      setProdutoEditando(null);
      setSucesso('Produto atualizado com sucesso!');
    } catch (error) {
      setErro('Não foi possível atualizar o produto.');
      setSucesso('');
    } finally {
      setCarregando(false);
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

  // P2 - Cores dinâmicas para os temas
  const escuro = tema === 'escuro';

  const cores = {
    fundo: escuro ? '#171717' : '#F4F8F4',
    texto: escuro ? '#FFFFFF' : '#374151',
    textoSecundario: escuro ? '#D1D5DB' : '#555555',
    titulo: escuro ? '#62D99B' : '#198754',
    fundoInput: escuro ? '#303030' : '#FFFFFF',
    borda: escuro ? '#62D99B' : '#198754',
    placeholder: escuro ? '#BDBDBD' : '#777777',
    fundoEndereco: escuro ? '#252525' : '#FFFFFF',
    fundoEdicao: escuro ? '#423515' : '#FFF7D6',
    textoEdicao: escuro ? '#FFE6A3' : '#92400E',
    sucesso: escuro ? '#86EFAC' : '#198754',
    erro: escuro ? '#FCA5A5' : '#DC2626',
  };

  const fonteAjustada = tamanhoFonte;

  // Aguarda o carregamento das preferências
  if (!preferenciasProntas) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#171717',
        }}
      />
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: cores.fundo },
      ]}
    >
    
      <Text
        style={styles.logo}
        accessibilityLabel="Ícone de carrinho de compras"
      >
        🛒
      </Text>

      <Text
        style={[
          styles.titulo,
          {
            color: cores.titulo,
            fontSize: fonteAjustada + 11,
          },
        ]}
        accessibilityRole="header"
      >
        Menor Preço Saqua
      </Text>

      <Text
        style={[
          styles.subtitulo,
          {
            color: cores.textoSecundario,
            fontSize: fonteAjustada,
          },
        ]}
      >
        Cadastre produtos, preços e o local onde a oferta foi encontrada.
      </Text>

      {produtoEditando && (
        <View
          style={[
            styles.caixaEdicao,
            { backgroundColor: cores.fundoEdicao },
          ]}
        >
          <Text
            style={[
              styles.textoEdicao,
              {
                color: cores.textoEdicao,
                fontSize: fonteAjustada,
              },
            ]}
          >
            ✏️ Editando produto
          </Text>
        </View>
      )}

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: cores.fundoInput,
            color: cores.texto,
            borderColor: cores.borda,
            fontSize: fonteAjustada,
          },
        ]}
        placeholder="Nome do produto"
        placeholderTextColor={cores.placeholder}
        accessibilityLabel="Nome do produto"
        accessibilityHint="Digite o nome do produto"
        value={produto}
        onChangeText={(texto) => {
          setProduto(texto);
          setErro('');
          setSucesso('');
        }}
      />

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: cores.fundoInput,
            color: cores.texto,
            borderColor: cores.borda,
            fontSize: fonteAjustada,
          },
        ]}
        placeholder="Preço encontrado"
        placeholderTextColor={cores.placeholder}
        accessibilityLabel="Preço encontrado"
        accessibilityHint="Digite o preço do produto"
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
          <Text
            style={[
              styles.tituloCep,
              {
                color: cores.texto,
                fontSize: fonteAjustada,
              },
            ]}
            accessibilityRole="header"
          >
            Localização do mercado
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: cores.fundoInput,
                color: cores.texto,
                borderColor: cores.borda,
                fontSize: fonteAjustada,
              },
            ]}
            placeholder="CEP do mercado"
            placeholderTextColor={cores.placeholder}
            accessibilityLabel="CEP do mercado"
            accessibilityHint="Digite os oito números do CEP"
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
            accessibilityRole="button"
            accessibilityLabel="Buscar endereço pelo CEP"
            accessibilityState={{ disabled: carregando }}
          >
            <Text
              style={[
                styles.textoBotao,
                { fontSize: fonteAjustada },
              ]}
            >
              {carregando ? 'BUSCANDO...' : 'BUSCAR ENDEREÇO'}
            </Text>
          </TouchableOpacity>
        </>
      )}

      {carregando && (
        <View style={styles.loading}>
          <ActivityIndicator
            size="small"
            color={cores.titulo}
          />

          <Text
            style={[
              styles.textoLoading,
              {
                color: cores.textoSecundario,
                fontSize: fonteAjustada,
              },
            ]}
          >
            Processando...
          </Text>
        </View>
      )}

      {erro !== '' && (
        <Text
          style={[
            styles.erro,
            {
              color: cores.erro,
              fontSize: fonteAjustada,
            },
          ]}
          accessibilityRole="alert"
        >
          ❌ {erro}
        </Text>
      )}

      {sucesso !== '' && (
        <Text
          style={[
            styles.sucesso,
            {
              color: cores.sucesso,
              fontSize: fonteAjustada,
            },
          ]}
          accessibilityLiveRegion="polite"
        >
          ✅ {sucesso}
        </Text>
      )}

      {endereco && !produtoEditando && (
        <View
          style={[
            styles.caixaEndereco,
            {
              backgroundColor: cores.fundoEndereco,
              borderColor: cores.borda,
            },
          ]}
        >
          <Text
            style={[
              styles.enderecoTitulo,
              {
                color: cores.titulo,
                fontSize: fonteAjustada,
              },
            ]}
          >
            📍 Endereço encontrado
          </Text>

          <Text
            style={[
              styles.enderecoTexto,
              {
                color: cores.texto,
                fontSize: fonteAjustada,
              },
            ]}
          >
            {endereco.logradouro || 'Logradouro não informado'}
          </Text>

          <Text
            style={[
              styles.enderecoTexto,
              {
                color: cores.texto,
                fontSize: fonteAjustada,
              },
            ]}
          >
            {endereco.bairro || 'Bairro não informado'}
          </Text>

          <Text
            style={[
              styles.enderecoTexto,
              {
                color: cores.texto,
                fontSize: fonteAjustada,
              },
            ]}
          >
            {endereco.localidade} - {endereco.uf}
          </Text>

          <Text
            style={[
              styles.enderecoTexto,
              {
                color: cores.texto,
                fontSize: fonteAjustada,
              },
            ]}
          >
            CEP: {endereco.cep}
          </Text>
        </View>
      )}

      {produtoEditando ? (
        <>
          <TouchableOpacity
            style={styles.botao}
            onPress={salvarEdicao}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Salvar alterações do produto"
            accessibilityState={{ disabled: carregando }}
          >
            <Text
              style={[
                styles.textoBotao,
                { fontSize: fonteAjustada },
              ]}
            >
              SALVAR ALTERAÇÕES
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={cancelarEdicao}
            disabled={carregando}
            accessibilityRole="button"
            accessibilityLabel="Cancelar edição do produto"
            accessibilityState={{ disabled: carregando }}
          >
            <Text
              style={[
                styles.textoBotao,
                { fontSize: fonteAjustada },
              ]}
            >
              CANCELAR EDIÇÃO
            </Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.botao}
          onPress={adicionarProduto}
          disabled={carregando}
          accessibilityRole="button"
          accessibilityLabel="Adicionar produto"
          accessibilityState={{ disabled: carregando }}
        >
          <Text
            style={[
              styles.textoBotao,
              { fontSize: fonteAjustada },
            ]}
          >
            ADICIONAR PRODUTO
          </Text>
        </TouchableOpacity>
      )}

      <Text
        style={[
          styles.contador,
          {
            color: cores.texto,
            fontSize: fonteAjustada,
          },
        ]}
      >
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
            tema={tema}
            tamanhoFonte={tamanhoFonte}
          />
        )}
        ListEmptyComponent={
          <Text
            style={[
              styles.listaVazia,
              {
                color: cores.textoSecundario,
                fontSize: fonteAjustada,
              },
            ]}
          >
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
    textAlign: 'center',
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

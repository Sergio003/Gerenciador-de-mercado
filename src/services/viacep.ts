import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

export type Endereco = {
  cep: string;
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
};

const CHAVE_CACHE_CEP = 'menor-preco-saqua-cep:';

function enderecoValido(dados: any): dados is Endereco {
  return (
    dados !== null &&
    typeof dados === 'object' &&
    typeof dados.cep === 'string' &&
    typeof dados.logradouro === 'string' &&
    typeof dados.bairro === 'string' &&
    typeof dados.localidade === 'string' &&
    typeof dados.uf === 'string'
  );
}

export async function buscarCep(
  cep: string
): Promise<Endereco> {

  const cepLimpo = cep.replace(/\D/g, '');

  if (cepLimpo.length !== 8) {
    throw new Error('Digite um CEP válido com 8 números.');
  }

  const chave = `${CHAVE_CACHE_CEP}${cepLimpo}`;

  let enderecoSalvo: Endereco | null = null;

  try {
    const cache = await AsyncStorage.getItem(chave);

    if (cache) {
      const dados = JSON.parse(cache);

      if (
        enderecoValido(dados) &&
        dados.cep.replace(/\D/g, '') === cepLimpo
      ) {
        enderecoSalvo = dados;
      }
    }
  } catch (error) {
    console.warn('Não foi possível consultar o cache de CEP:', error);
  }

  const estado = await NetInfo.fetch();

  const semInternet =
    estado.isConnected === false ||
    estado.isInternetReachable === false;

  if (semInternet) {
    if (enderecoSalvo) {
      return enderecoSalvo;
    }

    throw new Error(
      'CEP não armazenado. Consulte esse endereço com internet primeiro.'
    );
  }

  const controlador = new AbortController();

  const timeout = setTimeout(() => {
    controlador.abort();
  }, 10000);

  try {
    const resposta = await fetch(
      `https://viacep.com.br/ws/${cepLimpo}/json/`,
      { signal: controlador.signal }
    );

    if (!resposta.ok) {
      throw new Error('Não foi possível consultar o CEP.');
    }

    const dados = await resposta.json();

    if (dados.erro || !enderecoValido(dados)) {
      throw new Error('CEP não encontrado.');
    }

    const endereco: Endereco = {
      cep: dados.cep,
      logradouro: dados.logradouro,
      bairro: dados.bairro,
      localidade: dados.localidade,
      uf: dados.uf,
    };

    try {
      await AsyncStorage.setItem(
        chave,
        JSON.stringify(endereco)
      );
    } catch (error) {
      console.warn('Não foi possível salvar o CEP no cache:', error);
    }

    return endereco;

  } catch (error) {
    if (enderecoSalvo) {
      return enderecoSalvo;
    }

    throw error;

  } finally {
    clearTimeout(timeout);
  }
}
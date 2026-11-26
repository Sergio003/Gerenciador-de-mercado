
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cadastrarProduto } from './produtosApi';
import { supabase } from './supabase';

export type ProdutoPendente = {
  operacaoId: string;
  usuarioId: string;
  nome: string;
  preco: string;
  endereco: string;
  criadoEm: string;
};

export const CHAVE_FILA_OFFLINE =
  'menor-preco-saqua-fila-offline-v1';

let filaOperacoes: Promise<void> = Promise.resolve();

let sincronizacaoEmAndamento = false;

async function executarOperacaoExclusiva<T>(
  operacao: () => Promise<T>
): Promise<T> {
  const operacaoAnterior = filaOperacoes;

  let liberarOperacao!: () => void;

  filaOperacoes = new Promise<void>((resolve) => {
    liberarOperacao = resolve;
  });

  await operacaoAnterior;

  try {
    return await operacao();
  } finally {
    liberarOperacao();
  }
}

export async function obterProdutosPendentes(
  usuarioId: string
): Promise<ProdutoPendente[]> {
  const dados = await AsyncStorage.getItem(CHAVE_FILA_OFFLINE);

  if (!dados) {
    return [];
  }

  const fila: unknown = JSON.parse(dados);

  if (!Array.isArray(fila)) {
    throw new Error('Formato inválido da fila offline.');
  }

  return fila.filter(
    (item): item is ProdutoPendente =>
      item !== null &&
      typeof item === 'object' &&
      typeof item.operacaoId === 'string' &&
      typeof item.usuarioId === 'string' &&
      item.usuarioId === usuarioId &&
      typeof item.nome === 'string' &&
      typeof item.preco === 'string' &&
      typeof item.endereco === 'string' &&
      typeof item.criadoEm === 'string'
  );
}

export async function adicionarProdutoPendente(
  novoProduto: ProdutoPendente
): Promise<void> {
  return executarOperacaoExclusiva(async () => {
    const dados = await AsyncStorage.getItem(CHAVE_FILA_OFFLINE);

    const fila: unknown = dados ? JSON.parse(dados) : [];

    if (!Array.isArray(fila)) {
      throw new Error('Formato inválido da fila offline.');
    }

    const operacaoExistente = fila.some(
      (item) =>
        item !== null &&
        typeof item === 'object' &&
        'operacaoId' in item &&
        item.operacaoId === novoProduto.operacaoId
    );

    if (operacaoExistente) {
      return;
    }

    await AsyncStorage.setItem(
      CHAVE_FILA_OFFLINE,
      JSON.stringify([...fila, novoProduto])
    );
  });
}

export async function removerProdutoPendente(
  operacaoId: string,
  usuarioId: string
): Promise<void> {
  return executarOperacaoExclusiva(async () => {
    const dados = await AsyncStorage.getItem(CHAVE_FILA_OFFLINE);

    if (!dados) {
      return;
    }

    const fila: unknown = JSON.parse(dados);

    if (!Array.isArray(fila)) {
      throw new Error('Formato inválido da fila offline.');
    }

    const filaAtualizada = fila.filter(
      (item) =>
        !(
          item !== null &&
          typeof item === 'object' &&
          'operacaoId' in item &&
          'usuarioId' in item &&
          item.operacaoId === operacaoId &&
          item.usuarioId === usuarioId
        )
    );

    await AsyncStorage.setItem(
      CHAVE_FILA_OFFLINE,
      JSON.stringify(filaAtualizada)
    );
  });
}

export async function sincronizarProdutosPendentes(
  usuarioId: string
): Promise<number> {
  if (sincronizacaoEmAndamento) {
    return 0;
  }

  sincronizacaoEmAndamento = true;

  try {
    const { data, error } = await supabase.auth.getUser();

    if (
      error ||
      !data.user ||
      data.user.id !== usuarioId
    ) {
      throw new Error(
        'Usuário não autenticado ou diferente do proprietário dos produtos pendentes.'
      );
    }

    const produtosPendentes =
      await obterProdutosPendentes(usuarioId);

    let totalSincronizado = 0;

    for (const produto of produtosPendentes) {
      try {
        await cadastrarProduto(
          produto.nome,
          produto.preco,
          produto.endereco,
          produto.operacaoId,
          usuarioId
        );

        await removerProdutoPendente(
          produto.operacaoId,
          usuarioId
        );

        totalSincronizado++;
      } catch (erro) {
        console.warn(
          'Sincronização interrompida. Os produtos restantes serão mantidos na fila.',
          erro
        );

        break;
      }
    }

    return totalSincronizado;
  } finally {
    sincronizacaoEmAndamento = false;
  }
}

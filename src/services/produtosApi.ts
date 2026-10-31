import { supabase } from './supabase';

const API_URL =
  'https://menor-preco-saqua-api-8b8q.onrender.com';

async function obterTokenAutenticacao(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error(
      'Sua sessão expirou. Faça login novamente para continuar.'
    );
  }

  return data.session.access_token;
}

export type ProdutoApi = {
  _id: string;
  nome: string;
  preco: string;
  endereco: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function listarProdutos(): Promise<ProdutoApi[]> {
  const resposta = await fetch(`${API_URL}/produtos`);

  if (!resposta.ok) {
    throw new Error('Não foi possível buscar os produtos.');
  }

  return resposta.json();
}

export async function cadastrarProduto(
  nome: string,
  preco: string,
  endereco: string
): Promise<ProdutoApi> {
  const token = await obterTokenAutenticacao();
  
  const resposta = await fetch(`${API_URL}/produtos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      nome,
      preco,
      endereco,
    }),
  });

  if (!resposta.ok) {
    throw new Error('Não foi possível cadastrar o produto.');
  }

  return resposta.json();
}

export async function atualizarProduto(
  id: string,
  nome: string,
  preco: string,
  endereco: string
): Promise<ProdutoApi> {
  const token = await obterTokenAutenticacao();
  
  const resposta = await fetch(
    `${API_URL}/produtos/${id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        nome,
        preco,
        endereco,
      }),
    }
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível atualizar o produto.');
  }

  return resposta.json();
}

export async function excluirProduto(
  id: string
): Promise<void> {
  const token = await obterTokenAutenticacao();

  const resposta = await fetch(
    `${API_URL}/produtos/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!resposta.ok) {
    throw new Error('Não foi possível remover o produto.');
  }
}
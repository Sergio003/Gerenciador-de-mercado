
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');
const readline = require('node:readline/promises');
const { randomUUID } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const API = 'http://localhost:3000';
const resultados = [];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function criarCliente() {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

const admin = criarCliente();
const aluno = criarCliente();

function verificar(nome, aprovado, detalhe) {
  const linha =
    `${aprovado ? '[APROVADO]' : '[FALHOU]'} ${nome}: ${detalhe}`;

  resultados.push({ aprovado, linha });
  console.log(linha);
}

async function requisicao(metodo, rota, token, dados) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API}${rota}`, {
    method: metodo,
    headers,
    body: dados === undefined
      ? undefined
      : JSON.stringify(dados),
  });

  const texto = await resposta.text();

  let corpo;

  try {
    corpo = JSON.parse(texto);
  } catch {
    corpo = texto;
  }

  return {
    status: resposta.status,
    corpo,
  };
}

async function login(cliente, email, senha) {
  const { data, error } =
    await cliente.auth.signInWithPassword({
      email,
      password: senha,
    });

  if (error || !data.session) {
    throw new Error('Falha no login de ' + email);
  }

  const { data: leaseId, error: erroSessao } =
    await cliente.rpc('begin_session');

  if (erroSessao || !leaseId) {
    throw new Error(
      'Falha ao iniciar sessao: ' +
      (erroSessao?.message || 'Sessao nao retornada')
    );
  }

  return {
    ...data.session,
    leaseId,
  };
}

async function consultarPapel(cliente, id) {
  const { data, error } = await cliente
    .from('profiles')
    .select('role')
    .eq('id', id)
    .single();

  if (error) {
        throw new Error(
            `Falha ao consultar perfil. Codigo: ${error.code}. Mensagem: ${error.message}`
        );
    }

  return data.role;
}

async function executar() {
  let sessaoAdmin;
  let sessaoAluno;
  let produtoId;
  let concluido = false;

  try {
    console.log('\n=== TESTES DE SEGURANCA P2 ===\n');
    console.log('As senhas serao digitadas apenas neste terminal.');
    console.log('Nao compartilhe capturas contendo as senhas.\n');

    const senhaAdmin = await rl.question(
      'Senha do Aluno A (admin): '
    );

    const senhaAluno = await rl.question(
      'Senha do Aluno B (aluno): '
    );

    sessaoAdmin = await login(
      admin,
      'alunoa@email.com',
      senhaAdmin
    );

    sessaoAluno = await login(
      aluno,
      'alunob@email.com',
      senhaAluno
    );

    const papelAdmin = await consultarPapel(
      admin,
      sessaoAdmin.user.id
    );

    const papelAluno = await consultarPapel(
      aluno,
      sessaoAluno.user.id
    );

    verificar(
      'Perfil administrador',
      papelAdmin === 'admin',
      papelAdmin
    );

    verificar(
      'Perfil aluno',
      papelAluno === 'aluno',
      papelAluno
    );

    if (papelAdmin !== 'admin' || papelAluno !== 'aluno') {
      throw new Error('Papeis diferentes dos esperados.');
    }

    const tokenAdmin = sessaoAdmin.access_token;
    const tokenAluno = sessaoAluno.access_token;

    const dados = {
      nome: 'TESTE AUTOMATIZADO P2 ' + randomUUID(),
      preco: '10,00',
      endereco: 'Endereco temporario de teste',
      operacaoId: randomUUID(),
    };

    const cadastro = await requisicao(
      'POST', '/produtos', tokenAluno, dados
    );

    produtoId = cadastro.corpo?._id;

    verificar(
      'Cadastro pelo aluno',
      cadastro.status === 201 && !!produtoId,
      `HTTP ${cadastro.status}`
    );

    if (cadastro.status !== 201 || !produtoId) {
      throw new Error('Produto de teste nao criado.');
    }

    const repeticao = await requisicao(
      'POST', '/produtos', tokenAluno, dados
    );

    verificar(
      'Protecao contra duplicidade',
      repeticao.status === 200 &&
        repeticao.corpo?._id === produtoId,
      `HTTP ${repeticao.status} - mesmo ID: ${
        repeticao.corpo?._id === produtoId
      }`
    );

    const rota = `/produtos/${produtoId}`;

    const alteracao = {
      nome: dados.nome + ' EDITADO',
      preco: '15,00',
      endereco: dados.endereco,
    };

    const editarAluno = await requisicao(
      'PUT', rota, tokenAluno, alteracao
    );

    verificar(
      'Aluno impedido de editar',
      editarAluno.status === 403,
      `HTTP ${editarAluno.status}`
    );

    const excluirAluno = await requisicao(
      'DELETE', rota, tokenAluno
    );

    verificar(
      'Aluno impedido de excluir',
      excluirAluno.status === 403,
      `HTTP ${excluirAluno.status}`
    );

    const editarAdmin = await requisicao(
      'PUT', rota, tokenAdmin, alteracao
    );

    verificar(
      'Administrador autorizado a editar',
      editarAdmin.status === 200 &&
        editarAdmin.corpo?.nome === alteracao.nome,
      `HTTP ${editarAdmin.status}`
    );

    const excluirAdmin = await requisicao(
      'DELETE', rota, tokenAdmin
    );

    verificar(
      'Administrador autorizado a excluir',
      excluirAdmin.status === 200,
      `HTTP ${excluirAdmin.status}`
    );

    if (excluirAdmin.status === 200) {
      produtoId = undefined;
    }

    // Verifica a restricao de escrita na coluna role
    // sem promover efetivamente o usuario.
    const tentativa = await aluno
      .from('profiles')
      .update({ role: 'aluno' })
      .eq('id', sessaoAluno.user.id)
      .select('role');

    const papelFinal = await consultarPapel(
      aluno,
      sessaoAluno.user.id
    );

    verificar(
      'Coluna role protegida contra escrita',
      tentativa.error?.code === '42501' &&
        papelFinal === 'aluno',
      tentativa.error
        ? `Bloqueado - codigo ${tentativa.error.code}`
        : 'Escrita na coluna nao foi bloqueada'
    );

    concluido = true;

  } catch (erro) {
    verificar(
      'Execucao completa',
      false,
      erro.message
    );

  } finally {
    if (produtoId && sessaoAdmin) {
      try {
        const limpeza = await requisicao(
          'DELETE',
          `/produtos/${produtoId}`,
          sessaoAdmin.access_token
        );

        verificar(
          'Limpeza do produto temporario',
          [200, 404].includes(limpeza.status),
          `HTTP ${limpeza.status}`
        );
      } catch {
        verificar(
          'Limpeza do produto temporario',
          false,
          'Verificar produto manualmente'
        );
      }
    }

    await Promise.allSettled([
  sessaoAdmin?.leaseId
    ? admin.rpc('end_session', {
        p_id: sessaoAdmin.leaseId,
      })
    : Promise.resolve(),

  sessaoAluno?.leaseId
    ? aluno.rpc('end_session', {
        p_id: sessaoAluno.leaseId,
      })
    : Promise.resolve(),
]);

    await Promise.allSettled([
        admin.auth.signOut({ scope: 'local' }),
        aluno.auth.signOut({ scope: 'local' }),
    ]);

    rl.close();

    const aprovados = resultados.filter(
      item => item.aprovado
    ).length;

    const total = resultados.length;

    const resumo = [
      'MENOR PRECO SAQUA - P2',
      'TESTES AUTOMATIZADOS DE SEGURANCA',
      new Date().toISOString(),
      '',
      ...resultados.map(item => item.linha),
      '',
      `Resultado: ${aprovados}/${total} aprovados`,
    ].join('\n');

    const pasta = path.join(
      __dirname,
      '..',
      'evidencias_p2',
      '08_seguranca_e_testes'
    );

    fs.mkdirSync(pasta, { recursive: true });

    fs.writeFileSync(
      path.join(pasta, '06_testes_permissoes.txt'),
      resumo,
      'utf8'
    );

    console.log('\n' + resumo);
    console.log('\nEvidencia salva automaticamente.');

    if (!concluido || aprovados !== total) {
      process.exitCode = 1;
    }
  }
}

executar();

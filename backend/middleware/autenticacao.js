const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function verificarAutenticacao(req, res, next) {
  try {
    const authorization = req.headers.authorization;

    if (
      !authorization ||
      !authorization.startsWith('Bearer ')
    ) {
      return res.status(401).json({
        mensagem: 'Token de autenticação não informado.',
      });
    }

    const token = authorization.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        mensagem: 'Token de autenticação inválido.',
      });
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    req.usuario = data.user;
    req.tokenAutenticacao = token;

    next();
  } catch (erro) {
    console.error('Erro ao validar autenticação:', erro.message);

    return res.status(500).json({
      mensagem: 'Erro ao verificar autenticação.',
    });
  }
}

// Autorização de administrador
async function verificarAdministrador(req, res, next) {
  try {
    if (!req.usuario || !req.tokenAutenticacao) {
      return res.status(401).json({
        mensagem: 'Usuário não autenticado.',
      });
    }

    const supabaseUsuario = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_ANON_KEY,
      {
        global: {
          headers: {
            Authorization: `Bearer ${req.tokenAutenticacao}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: perfil, error } = await supabaseUsuario
      .from('profiles')
      .select('role')
      .eq('id', req.usuario.id)
      .maybeSingle();

    if (error) {
      console.error(
        'Erro ao consultar permissões:',
        error.message
      );

      return res.status(500).json({
        mensagem: 'Não foi possível verificar as permissões.',
      });
    }

    if (!perfil || perfil.role !== 'admin') {
      return res.status(403).json({
        mensagem: 'Acesso negado. Operação exclusiva de administradores.',
      });
    }

    next();
  } catch (erro) {
    console.error('Erro ao verificar autorização:', erro.message);

    return res.status(500).json({
      mensagem: 'Erro ao verificar autorização.',
    });
  }
}

module.exports = verificarAutenticacao;
module.exports.verificarAdministrador = verificarAdministrador;

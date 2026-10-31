
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

    next();
  } catch (erro) {
    console.error('Erro ao validar autenticação:', erro.message);

    return res.status(500).json({
      mensagem: 'Erro ao verificar autenticação.',
    });
  }
}

module.exports = verificarAutenticacao;

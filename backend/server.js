
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const dns = require('dns');

dns.setServers([
  '8.8.8.8',
  '1.1.1.1',
]);

const Produto = require('./models/Produto');
const verificarAutenticacao = require('./middleware/autenticacao');
const PushToken = require('./models/PushToken');
const { notificarNovoProduto } = require('./services/notificacoesPush');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexão com MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Atlas conectado com sucesso!');
  })
  .catch((erro) => {
    console.error(
      'Erro ao conectar ao MongoDB:',
      erro.message
    );
  });

// Rota inicial
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Menor Preço Saqua funcionando!',
  });
});

// Listar produtos
app.get('/produtos', async (req, res) => {
  try {
    const produtos = await Produto.find().sort({
      createdAt: -1,
    });

    res.json(produtos);
  } catch (erro) {
    console.error('ERRO AO BUSCAR PRODUTOS:', erro);

    res.status(500).json({
      mensagem: 'Erro ao buscar produtos.',
      erro: erro.message,
    });
  }
});

// Cadastrar produto
app.post('/produtos', verificarAutenticacao, async (req, res) => {
  try {
    const { nome, preco, endereco } = req.body;

    if (!nome || !preco || !endereco) {
      return res.status(400).json({
        mensagem: 'Nome, preço e endereço são obrigatórios.',
      });
    }

    const produto = await Produto.create({
      nome,
      preco,
      endereco,
    });

    res.status(201).json(produto);

    // Notifica outros usuários sobre o novo produto
    void notificarNovoProduto(produto, req.usuario.id);
  } catch (erro) {
    console.error('Erro ao cadastrar produto:', erro);

    res.status(500).json({
      mensagem: 'Erro ao cadastrar produto.',
    });
  }
});

// Atualizar produto
app.put('/produtos/:id', verificarAutenticacao, async (req, res) => {
  try {
    const { nome, preco, endereco } = req.body;

    const produto = await Produto.findByIdAndUpdate(
      req.params.id,
      {
        nome,
        preco,
        endereco,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!produto) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.',
      });
    }

    res.json(produto);
  } catch (erro) {
    console.error('Erro ao atualizar produto:', erro);

    res.status(500).json({
      mensagem: 'Erro ao atualizar produto.',
    });
  }
});

// Excluir produto
app.delete('/produtos/:id', verificarAutenticacao, async (req, res) => {
  try {
    const produto = await Produto.findByIdAndDelete(
      req.params.id
    );

    if (!produto) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.',
      });
    }

    res.json({
      mensagem: 'Produto removido com sucesso!',
    });
  } catch (erro) {
    console.error('Erro ao remover produto:', erro);

    res.status(500).json({
      mensagem: 'Erro ao remover produto.',
    });
  }
});

// Registrar token Push e preferência de som
app.post(
  '/notificacoes/token',
  verificarAutenticacao,
  async (req, res) => {
    try {
      const { token, plataforma, somAtivado } = req.body;

      // Validação dos dados recebidos
      if (
        typeof token !== 'string' ||
        !/^(ExponentPushToken|ExpoPushToken)\[[^\]]+\]$/.test(token) ||
        !['android', 'ios'].includes(plataforma) ||
        (
          somAtivado !== undefined &&
          typeof somAtivado !== 'boolean'
        )
      ) {
        return res.status(400).json({
          mensagem:
            'Token Push, plataforma ou preferência de som inválidos.',
        });
      }

      const dadosAtualizacao = {
        usuarioId: req.usuario.id,
        plataforma,
      };

      // Atualiza o som apenas quando a preferência for enviada
      if (typeof somAtivado === 'boolean') {
        dadosAtualizacao.somAtivado = somAtivado;
      }

      await PushToken.findOneAndUpdate(
        { token },
        {
          $set: dadosAtualizacao,
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      res.json({
        mensagem:
          'Token e preferência de notificação registrados com sucesso!',
      });
    } catch (erro) {
      console.error('Erro ao registrar token Push:', erro);

      res.status(500).json({
        mensagem: 'Erro ao registrar token de notificação.',
      });
    }
  }
);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

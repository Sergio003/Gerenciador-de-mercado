const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const dns = require('dns');

dns.setServers([
  '8.8.8.8',
  '1.1.1.1'
]);

const Produto = require('./models/Produto');
const verificarAutenticacao = require('./middleware/autenticacao');
const PushToken = require('./models/PushToken');
const { notificarNovoProduto } = require('./services/notificacoesPush');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

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

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Menor Preço Saqua funcionando!',
  });
});

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

app.post('/produtos', verificarAutenticacao, async (req, res) => {
  try {
    const { nome, preco, endereco } = req.body;

    if (!nome || !preco || !endereco) {
      return res.status(400).json({
        mensagem:
          'Nome, preço e endereço são obrigatórios.',
      });
    }

    const produto = await Produto.create({
      nome,
      preco,
      endereco,
    });

    res.status(201).json(produto);

    void notificarNovoProduto(produto, req.usuario.id);
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar produto.',
    });
  }
});

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
    res.status(500).json({
      mensagem: 'Erro ao atualizar produto.',
    });
  }
});

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
    res.status(500).json({
      mensagem: 'Erro ao remover produto.',
    });
  }
});


app.post('/notificacoes/token', verificarAutenticacao, async (req, res) => {
  try {
    const { token, plataforma } = req.body;

    if (
      typeof token !== 'string' ||
      !/^ExponentPushToken\[[^\]]+\]$|^ExpoPushToken\[[^\]]+\]$/.test(token) ||
      !['android', 'ios'].includes(plataforma)
    ) {
      return res.status(400).json({
        mensagem: 'Token Push ou plataforma inválidos.',
      });
    }

    await PushToken.findOneAndUpdate(
      { token },
      {
        $set: {
          usuarioId: req.usuario.id,
          plataforma,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.json({
      mensagem: 'Token de notificação registrado com sucesso!',
    });
  } catch (erro) {
    console.error('Erro ao registrar token Push:', erro);

    res.status(500).json({
      mensagem: 'Erro ao registrar token de notificação.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

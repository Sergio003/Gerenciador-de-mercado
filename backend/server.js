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

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB Atlas
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

// Rota inicial para testar a API
app.get('/', (req, res) => {
  res.json({
    mensagem: 'API Menor Preço Saqua funcionando!',
  });
});

// LISTAR todos os produtos
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

// CADASTRAR produto
app.post('/produtos', async (req, res) => {
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
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar produto.',
    });
  }
});

// EDITAR produto
app.put('/produtos/:id', async (req, res) => {
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

// EXCLUIR produto
app.delete('/produtos/:id', async (req, res) => {
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

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
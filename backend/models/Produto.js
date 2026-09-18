const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
    },

    preco: {
      type: String,
      required: true,
      trim: true,
    },

    endereco: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;
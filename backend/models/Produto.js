
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

    // Identificador único para sincronização offline
    operacaoId: {
      type: String,
      trim: true,
      default: undefined,
    },

    usuarioId: {
      type: String,
      trim: true,
      default: undefined,
    },

  },
  {
    timestamps: true,
  }
);

// Impede duplicações de operações sincronizadas.
// O índice parcial ignora produtos antigos sem operacaoId.
produtoSchema.index(
  { operacaoId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      operacaoId: { $type: 'string' },
    },
  }
);

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;

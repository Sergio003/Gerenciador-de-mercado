
const mongoose = require('mongoose');

const pushTokenSchema = new mongoose.Schema(
  {
    usuarioId: {
      type: String,
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    plataforma: {
      type: String,
      enum: ['android', 'ios'],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('PushToken', pushTokenSchema);

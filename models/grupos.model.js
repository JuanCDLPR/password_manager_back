const { Schema, model } = require("mongoose");

const GruposSchema = new Schema({
  id_usuario: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  acronimo: {
    type: String,
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
  actualizado: {
    type: Date,
    default: Date.now,
  },
});

module.exports = model("GRUPOS", GruposSchema);

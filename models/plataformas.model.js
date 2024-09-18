const { Schema, model } = require("mongoose");

const PlataformasSchema = new Schema({
  id_usuario: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
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

module.exports = model("PLATAFORMAS", PlataformasSchema);

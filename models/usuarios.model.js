const { Schema, model } = require("mongoose");

const UsuariosSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: false,
    default: "",
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

module.exports = model("USUARIOS", UsuariosSchema);

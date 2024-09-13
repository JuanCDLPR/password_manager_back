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
});

module.exports = model("USUARIOS", UsuariosSchema);

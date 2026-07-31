const { Schema, model } = require("mongoose");

const UsuariosSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    user: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 50,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    img: {
      type: String,
      default: "",
      maxlength: 2048,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    actualizado: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (_document, result) => {
        delete result.password;
        delete result.tokenVersion;
        return result;
      },
    },
  }
);

module.exports = model("USUARIOS", UsuariosSchema);

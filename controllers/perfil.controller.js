const bcrypt = require("bcryptjs");
const { request, response } = require("express");
const { generarJWT } = require("../helpers/jwt");
const {
  cleanString,
  isValidName,
  isValidOptionalHttpUrl,
  isValidPassword,
  isValidUser,
  normalizeUser,
} = require("../helpers/validation");
const { Respuesta } = require("../models/repuesta");
const UsuariosModel = require("../models/usuarios.model");

const consultar = async (req = request, res = response) => {
  try {
    const usuario = await UsuariosModel.findById(req.uid).select(
      "name user img fecha actualizado"
    );

    if (!usuario) {
      return res
        .status(404)
        .json(Respuesta(404, "error", "No se encontró el usuario", []));
    }

    return res
      .status(200)
      .json(Respuesta(200, "ok", "Perfil encontrado", [usuario]));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible consultar el perfil", []));
  }
};

const actualizar = async (req = request, res = response) => {
  const name = cleanString(req.body.nombre);
  const user = normalizeUser(req.body.usuario);
  const img = cleanString(req.body.url);

  if (
    !isValidName(name) ||
    !isValidUser(user) ||
    !isValidOptionalHttpUrl(img)
  ) {
    return res
      .status(400)
      .json(Respuesta(400, "error", "Los datos del perfil no son válidos", []));
  }

  try {
    const usuarioExistente = await UsuariosModel.exists({
      user,
      _id: { $ne: req.uid },
    });

    if (usuarioExistente) {
      return res
        .status(409)
        .json(Respuesta(409, "error", "Este usuario ya existe", []));
    }

    const usuario = await UsuariosModel.findByIdAndUpdate(
      req.uid,
      { name, user, img, actualizado: new Date() },
      { new: true, runValidators: true }
    ).select("+tokenVersion");

    if (!usuario) {
      return res
        .status(404)
        .json(Respuesta(404, "error", "No se encontró el usuario", []));
    }

    const token = await generarJWT(usuario.id, usuario.tokenVersion);
    return res.status(200).json(
      Respuesta(200, "ok", "Perfil actualizado", [
        { name: usuario.name, user: usuario.user, token },
      ])
    );
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json(Respuesta(409, "error", "Este usuario ya existe", []));
    }

    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible actualizar el perfil", []));
  }
};

const update_pass = async (req = request, res = response) => {
  const { old_pass: oldPassword, pass: password, rep_pass: repeat } = req.body;

  if (!isValidPassword(password) || password !== repeat) {
    return res.status(400).json(
      Respuesta(
        400,
        "error",
        "La nueva contraseña debe tener entre 12 y 128 caracteres y coincidir",
        []
      )
    );
  }

  try {
    const usuario = await UsuariosModel.findById(req.uid).select(
      "+password +tokenVersion"
    );

    if (
      !usuario ||
      typeof oldPassword !== "string" ||
      !(await bcrypt.compare(oldPassword, usuario.password))
    ) {
      return res
        .status(401)
        .json(Respuesta(401, "error", "La contraseña actual no es correcta", []));
    }

    usuario.password = await bcrypt.hash(password, 12);
    usuario.tokenVersion += 1;
    usuario.actualizado = new Date();
    await usuario.save();

    const token = await generarJWT(usuario.id, usuario.tokenVersion);
    return res
      .status(200)
      .json(Respuesta(200, "ok", "Contraseña actualizada", [token]));
  } catch {
    return res.status(500).json(
      Respuesta(500, "error", "No fue posible actualizar la contraseña", [])
    );
  }
};

module.exports = { actualizar, consultar, update_pass };

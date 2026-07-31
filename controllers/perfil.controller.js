const bcrypt = require("bcryptjs");
const { generarJWT } = require("../helpers/jwt");
const { RESP } = require("../helpers/http");
const {
  cleanString,
  isValidName,
  isValidOptionalHttpUrl,
  isValidPassword,
  isValidUser,
  normalizeUser,
} = require("../helpers/validation");
const UsuariosModel = require("../models/usuarios.model");

const consultar = async (req, res) => {
  const usuario = await UsuariosModel.findById(req.uid).select(
    "name user img fecha actualizado"
  );

  if (!usuario) {
    throw RESP.NotFound("No se encontró el usuario");
  }

  return RESP.Ok(res, usuario, "Perfil encontrado");
};

const actualizar = async (req, res) => {
  const name = cleanString(req.body.nombre);
  const user = normalizeUser(req.body.usuario);
  const img = cleanString(req.body.url);

  const invalidFields = [
    ...(!isValidName(name) ? ["nombre"] : []),
    ...(!isValidUser(user) ? ["usuario"] : []),
    ...(!isValidOptionalHttpUrl(img) ? ["url"] : []),
  ];

  if (invalidFields.length) {
    throw RESP.Validation(
      "Los datos del perfil no son válidos",
      { fields: invalidFields }
    );
  }

  const usuarioExistente = await UsuariosModel.exists({
    user,
    _id: { $ne: req.uid },
  });

  if (usuarioExistente) {
    throw RESP.Conflict(
      "Este usuario ya existe",
      { fields: ["usuario"] }
    );
  }

  const usuario = await UsuariosModel.findByIdAndUpdate(
    req.uid,
    { name, user, img, actualizado: new Date() },
    { new: true, runValidators: true }
  ).select("+tokenVersion");

  if (!usuario) {
    throw RESP.NotFound("No se encontró el usuario");
  }

  const token = await generarJWT(usuario.id, usuario.tokenVersion);
  return RESP.Ok(
    res,
    { name: usuario.name, user: usuario.user, token },
    "Perfil actualizado"
  );
};

const actualizarPassword = async (req, res) => {
  const { old_pass: oldPassword, pass: password, rep_pass: repeat } = req.body;

  if (!isValidPassword(password) || password !== repeat) {
    throw RESP.Validation(
      "La nueva contraseña debe tener entre 12 y 128 caracteres y coincidir",
      { fields: ["pass", "rep_pass"] }
    );
  }

  const usuario = await UsuariosModel.findById(req.uid).select(
    "+password +tokenVersion"
  );

  if (
    !usuario ||
    typeof oldPassword !== "string" ||
    !(await bcrypt.compare(oldPassword, usuario.password))
  ) {
    throw RESP.InvalidCredentials("La contraseña actual no es correcta");
  }

  usuario.password = await bcrypt.hash(password, 12);
  usuario.tokenVersion += 1;
  usuario.actualizado = new Date();
  await usuario.save();

  const token = await generarJWT(usuario.id, usuario.tokenVersion);
  return RESP.Ok(res, { token }, "Contraseña actualizada");
};

module.exports = { actualizar, actualizarPassword, consultar };

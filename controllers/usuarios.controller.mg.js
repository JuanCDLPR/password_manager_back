const bcrypt = require("bcryptjs");
const { generarJWT } = require("../helpers/jwt");
const { RESP } = require("../helpers/http");
const {
  cleanString,
  isValidName,
  isValidPassword,
  isValidUser,
  normalizeUser,
} = require("../helpers/validation");
const UsuariosModel = require("../models/usuarios.model");

const registrar = async (req, res) => {
  const name = cleanString(req.body.name);
  const user = normalizeUser(req.body.user);
  const { password } = req.body;

  const invalidFields = [
    ...(!isValidName(name) ? ["name"] : []),
    ...(!isValidUser(user) ? ["user"] : []),
    ...(!isValidPassword(password) ? ["password"] : []),
  ];

  if (invalidFields.length) {
    throw RESP.Validation(
      "Nombre, usuario o contraseña no cumplen el formato requerido",
      { fields: invalidFields }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await UsuariosModel.create({ name, user, password: passwordHash });

  return RESP.Created(res, null, "Usuario registrado correctamente");
};

const autentificarte = async (req, res) => {
  const user = normalizeUser(req.body.user);
  const { password } = req.body;

  if (!isValidUser(user) || typeof password !== "string") {
    throw RESP.Validation("Usuario y contraseña son obligatorios");
  }

  const usuario = await UsuariosModel.findOne({ user }).select(
    "+password +tokenVersion"
  );
  const passwordValido =
    usuario && (await bcrypt.compare(password, usuario.password));

  if (!passwordValido) {
    throw RESP.InvalidCredentials();
  }

  const token = await generarJWT(usuario.id, usuario.tokenVersion);
  return RESP.Ok(
    res,
    { name: usuario.name, user: usuario.user, token },
    "Autenticación correcta"
  );
};

const refrescarToken = async (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string") {
    throw RESP.Validation(
      "La contraseña es obligatoria",
      { fields: ["password"] }
    );
  }

  const usuario = await UsuariosModel.findById(req.uid).select(
    "+password +tokenVersion"
  );

  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw RESP.InvalidCredentials("La contraseña no es correcta");
  }

  const token = await generarJWT(usuario.id, usuario.tokenVersion);
  return RESP.Ok(res, { token }, "Sesión renovada correctamente");
};

module.exports = { autentificarte, refrescarToken, registrar };

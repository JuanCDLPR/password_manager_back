const bcrypt = require("bcryptjs");
const { request, response } = require("express");
const { generarJWT } = require("../helpers/jwt");
const {
  cleanString,
  isValidName,
  isValidPassword,
  isValidUser,
  normalizeUser,
} = require("../helpers/validation");
const { Respuesta } = require("../models/repuesta");
const UsuariosModel = require("../models/usuarios.model");

const registrar = async (req = request, res = response) => {
  const name = cleanString(req.body.name);
  const user = normalizeUser(req.body.user);
  const { password } = req.body;

  if (!isValidName(name) || !isValidUser(user) || !isValidPassword(password)) {
    return res.status(400).json(
      Respuesta(
        400,
        "error",
        "Nombre, usuario o contraseña no cumplen el formato requerido",
        []
      )
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    await UsuariosModel.create({ name, user, password: passwordHash });

    return res
      .status(201)
      .json(Respuesta(201, "ok", "Usuario registrado correctamente", []));
  } catch (error) {
    if (error?.code === 11000) {
      return res
        .status(409)
        .json(Respuesta(409, "error", "Este usuario ya existe", []));
    }

    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible registrar al usuario", []));
  }
};

const autentificarte = async (req = request, res = response) => {
  const user = normalizeUser(req.body.user);
  const { password } = req.body;

  if (!isValidUser(user) || typeof password !== "string") {
    return res
      .status(400)
      .json(Respuesta(400, "error", "Credenciales inválidas", []));
  }

  try {
    const usuario = await UsuariosModel.findOne({ user }).select(
      "+password +tokenVersion"
    );
    const passwordValido =
      usuario && (await bcrypt.compare(password, usuario.password));

    if (!passwordValido) {
      return res
        .status(401)
        .json(Respuesta(401, "error", "Credenciales incorrectas", []));
    }

    const token = await generarJWT(usuario.id, usuario.tokenVersion);

    return res.status(200).json(
      Respuesta(200, "ok", "Autenticación correcta", {
        name: usuario.name,
        user: usuario.user,
        token,
      })
    );
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible iniciar sesión", []));
  }
};

const refrescar_token = async (req = request, res = response) => {
  const { uid } = req;
  const { password } = req.body;

  if (typeof password !== "string") {
    return res
      .status(400)
      .json(Respuesta(400, "error", "La contraseña es obligatoria", []));
  }

  try {
    const usuario = await UsuariosModel.findById(uid).select(
      "+password +tokenVersion"
    );

    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res
        .status(401)
        .json(Respuesta(401, "error", "La contraseña no es correcta", []));
    }

    const token = await generarJWT(usuario.id, usuario.tokenVersion);
    return res
      .status(200)
      .json(Respuesta(200, "ok", "Sesión renovada correctamente", [token]));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible renovar la sesión", []));
  }
};

module.exports = { autentificarte, refrescar_token, registrar };

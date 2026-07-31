const { request, response } = require("express");
const jwt = require("jsonwebtoken");
const { TOKEN_OPTIONS } = require("../helpers/jwt");
const { Respuesta } = require("../models/repuesta");
const UsuariosModel = require("../models/usuarios.model");

const validarJWT = async (req = request, res = response, next) => {
  const token = req.header("Administracion");

  if (!token) {
    return res
      .status(401)
      .json(Respuesta(401, "error", "No se encontró el token", []));
  }

  try {
    const { sub, ver } = jwt.verify(token, process.env.SEED_TOKEN, TOKEN_OPTIONS);
    const usuario = await UsuariosModel.findById(sub).select("+tokenVersion");

    if (!usuario || usuario.tokenVersion !== ver) {
      return res
        .status(401)
        .json(Respuesta(401, "error", "La sesión ya no es válida", []));
    }

    req.uid = usuario.id;
    next();
  } catch {
    return res
      .status(401)
      .json(Respuesta(401, "error", "Token no válido o expirado", []));
  }
};

module.exports = { validarJWT };

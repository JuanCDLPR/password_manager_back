const { response, request } = require("express");
const jwt = require("jsonwebtoken");
const { Respuesta } = require("../models/repuesta");

const validarJWT = (req = request, res = response, next) => {
  const token = req.header("Administracion");

  if (!token) {
    return res
      .status(401)
      .json(Respuesta(401, "error", "no se encontro el token", []));
  }

  try {
    const { id, user, pass, iat, exp } = jwt.verify(
      token,
      process.env.SEED_TOKEN
    );
    req.uid = id;
    req.user = user;
    req.pass = pass;
    req.creacion = iat;
    req.expira = exp;
  } catch (error) {
    return res.status(401).json(Respuesta(401, "error", "token no válido", []));
  }
  next();
};

module.exports = { validarJWT };

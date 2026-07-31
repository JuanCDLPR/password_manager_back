const jwt = require("jsonwebtoken");
const { TOKEN_OPTIONS } = require("../helpers/jwt");
const { HttpError, RESP } = require("../helpers/http");
const UsuariosModel = require("../models/usuarios.model");

const validarJWT = async (req, _res, next) => {
  req.authContext = { status: "missing" };
  const authorization = req.header("Authorization") || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(
      RESP.AuthRequired("Se requiere un token Bearer")
    );
  }

  try {
    const { sub, ver } = jwt.verify(token, process.env.SEED_TOKEN, TOKEN_OPTIONS);
    const usuario = await UsuariosModel.findById(sub).select("+tokenVersion");

    if (!usuario || usuario.tokenVersion !== ver) {
      req.authContext = { status: "invalid" };
      throw RESP.SessionInvalid("La sesión ya no es válida");
    }

    if (usuario.status === "disabled") {
      req.authContext = {
        status: "authenticated",
        userId: usuario.id,
        role: usuario.role,
      };
      throw RESP.AccountDisabled();
    }

    req.uid = usuario.id;
    req.auth = {
      userId: usuario.id,
      role: usuario.role,
      status: usuario.status,
      user: usuario.user,
      email: usuario.email || null,
    };
    req.authContext = {
      status: "authenticated",
      userId: usuario.id,
      role: usuario.role,
    };
    return next();
  } catch (error) {
    if (error instanceof HttpError) return next(error);
    req.authContext = { status: "invalid" };
    return next(
      RESP.SessionInvalid("Token no válido o expirado")
    );
  }
};

module.exports = { validarJWT };

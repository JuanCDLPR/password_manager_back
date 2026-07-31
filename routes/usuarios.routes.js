const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");
const {
  authLimiter,
  refreshLimiter,
  registerLimiter,
} = require("../middlewares/rate-limit");

const {
  registrar,
  autentificarte,
  refrescar_token,
} = require("../controllers/usuarios.controller.mg");

const router = Router();

router.post("/registrar", registerLimiter, registrar);
router.post("/auth", authLimiter, autentificarte);
router.post("/refresh", refreshLimiter, validarJWT, refrescar_token);

module.exports = { usuarios: router };

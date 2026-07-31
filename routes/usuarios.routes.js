const { Router } = require("express");
const {
  autentificarte,
  refrescarToken,
  registrar,
} = require("../controllers/usuarios.controller.mg");
const { asyncHandler } = require("../helpers/async-handler");
const { validarJWT } = require("../middlewares/validar-jws");
const {
  authLimiter,
  refreshLimiter,
  registerLimiter,
} = require("../middlewares/rate-limit");

const router = Router();

router.post("/", registerLimiter, asyncHandler(registrar));
router.post("/session", authLimiter, asyncHandler(autentificarte));
router.post(
  "/session/refresh",
  refreshLimiter,
  validarJWT,
  asyncHandler(refrescarToken)
);

module.exports = { usuarios: router };

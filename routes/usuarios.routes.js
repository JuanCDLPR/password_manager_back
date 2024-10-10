const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

/* const {
  registrar,
  autentificarte,
} = require("../controllers/usuarios.controller"); */

const {
  registrar,
  autentificarte,
  refrescar_token,
} = require("../controllers/usuarios.controller.mg");

const router = Router();

router.post("/registrar", registrar);
router.post("/auth", autentificarte);
router.get("/refresh", [validarJWT], refrescar_token);

module.exports = { usuarios: router };

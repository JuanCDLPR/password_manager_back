const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const {
  registrar,
  autentificarte,
} = require("../controllers/usuarios.controller");
const router = Router();

router.post("/registrar", registrar);
router.post("/auth", autentificarte);

module.exports = { usuarios: router };

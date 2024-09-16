const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const { consultar, actualizar } = require("../controllers/perfil.controller");

const router = Router();

router.get("/consultar", [validarJWT], consultar);
router.post("/actualizar", [validarJWT], actualizar);

module.exports = { perfil: router };

const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const { insertar } = require("../controllers/plataformas.controller");

const router = Router();

router.post("/insertar", [validarJWT], insertar);

module.exports = { plataformas: router };

const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const { insertar, listar } = require("../controllers/grupos.controller");

const router = Router();

router.post("/insertar", [validarJWT], insertar);
router.get("/listar", [validarJWT], listar);

module.exports = { grupos: router };

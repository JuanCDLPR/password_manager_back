const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const {
  insertar,
  listar,
  eliminar,
} = require("../controllers/plataformas.controller");

const router = Router();

router.post("/insertar", [validarJWT], insertar);
router.get("/listar", [validarJWT], listar);
router.post("/eliminar", [validarJWT], eliminar);

module.exports = { plataformas: router };

const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const {
  insertar,
  listar,
  eliminar,
  consultar,
  actualizar,
} = require("../controllers/plataformas.controller");

const router = Router();

router.post("/insertar", [validarJWT], insertar);
router.get("/listar", [validarJWT], listar);
router.post("/eliminar", [validarJWT], eliminar);
router.get("/consultar", [validarJWT], consultar);
router.post("/actualizar", [validarJWT], actualizar);

module.exports = { plataformas: router };

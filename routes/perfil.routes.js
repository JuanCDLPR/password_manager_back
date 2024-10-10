const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jws");

const {
  consultar,
  actualizar,
  update_pass,
} = require("../controllers/perfil.controller");

const router = Router();

router.get("/consultar", [validarJWT], consultar);
router.post("/actualizar", [validarJWT], actualizar);
router.post("/update_pass", [validarJWT], update_pass);

module.exports = { perfil: router };

const { Router } = require("express");
const {
  actualizar,
  actualizarPassword,
  consultar,
} = require("../controllers/perfil.controller");
const { asyncHandler } = require("../helpers/async-handler");
const { validarJWT } = require("../middlewares/validar-jws");

const router = Router();

router.use(validarJWT);
router.get("/", asyncHandler(consultar));
router.patch("/", asyncHandler(actualizar));
router.patch("/password", asyncHandler(actualizarPassword));

module.exports = { perfil: router };

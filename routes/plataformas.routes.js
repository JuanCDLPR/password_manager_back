const { Router } = require("express");
const {
  actualizar,
  consultar,
  eliminar,
  insertar,
  listar,
} = require("../controllers/plataformas.controller");
const { asyncHandler } = require("../helpers/async-handler");
const { validarJWT } = require("../middlewares/validar-jws");

const router = Router();

router.use(validarJWT);
router.get("/", asyncHandler(listar));
router.post("/", asyncHandler(insertar));
router.get("/:id", asyncHandler(consultar));
router.patch("/:id", asyncHandler(actualizar));
router.delete("/:id", asyncHandler(eliminar));

module.exports = { plataformas: router };

const { Router } = require("express");
const {
  actualizar,
  consultar,
  eliminar,
  insertar,
  listar,
} = require("./platform.controller");
const { asyncHandler } = require("../../shared/http/async-handler");
const { authenticate } = require("../auth/auth.middleware");

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(listar));
router.post("/", asyncHandler(insertar));
router.get("/:id", asyncHandler(consultar));
router.patch("/:id", asyncHandler(actualizar));
router.delete("/:id", asyncHandler(eliminar));

module.exports = { platformRoutes: router };

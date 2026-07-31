const { Router } = require("express");
const {
  actualizar,
  actualizarPassword,
  consultar,
} = require("./profile.controller");
const { asyncHandler } = require("../../shared/http/async-handler");
const { authenticate } = require("../auth/auth.middleware");

const router = Router();

router.use(authenticate);
router.get("/", asyncHandler(consultar));
router.patch("/", asyncHandler(actualizar));
router.patch("/password", asyncHandler(actualizarPassword));

module.exports = { profileRoutes: router };

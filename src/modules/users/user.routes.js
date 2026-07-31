const { Router } = require("express");
const {
  autentificarte,
  obtenerSesion,
  refrescarToken,
  registrar,
} = require("./user.controller");
const { asyncHandler } = require("../../shared/http/async-handler");
const { authenticate } = require("../auth/auth.middleware");
const {
  authLimiter,
  refreshLimiter,
  registerLimiter,
} = require("../../shared/middleware/rate-limit");

const router = Router();

router.post("/", registerLimiter, asyncHandler(registrar));
router.post("/session", authLimiter, asyncHandler(autentificarte));
router.get("/session", authenticate, asyncHandler(obtenerSesion));
router.post(
  "/session/refresh",
  refreshLimiter,
  authenticate,
  asyncHandler(refrescarToken)
);

module.exports = { userRoutes: router };

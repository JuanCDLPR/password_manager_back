const { Router } = require("express");
const {
  crear,
  listar,
  reenviar,
  revocar,
} = require("../controllers/invitaciones.controller");
const { asyncHandler } = require("../helpers/async-handler");
const { RESP } = require("../helpers/http");
const { requireRole } = require("../middlewares/require-role");
const { validarJWT } = require("../middlewares/validar-jws");

const router = Router();

router.use(validarJWT, requireRole("superadmin"));
router.get("/", (req, res) =>
  RESP.Ok(
    res,
    { role: req.auth.role },
    "Acceso administrativo autorizado"
  )
);
router.get("/invitations", asyncHandler(listar));
router.post("/invitations", asyncHandler(crear));
router.post("/invitations/:id/resend", asyncHandler(reenviar));
router.delete("/invitations/:id", asyncHandler(revocar));

module.exports = { admin: router };

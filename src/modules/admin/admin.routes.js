const { Router } = require("express");
const {
  crear,
  listar,
  reenviar,
  revocar,
} = require("../invitations/invitation.controller");
const { asyncHandler } = require("../../shared/http/async-handler");
const { RESP } = require("../../shared/http/response");
const { requireRole } = require("../auth/require-role.middleware");
const { authenticate } = require("../auth/auth.middleware");

const router = Router();

router.use(authenticate, requireRole("superadmin"));
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

module.exports = { adminRoutes: router };

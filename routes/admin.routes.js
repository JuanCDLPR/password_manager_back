const { Router } = require("express");
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

module.exports = { admin: router };

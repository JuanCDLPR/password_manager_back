const { Router } = require("express");
const { validar } = require("../controllers/invitaciones.controller");
const { asyncHandler } = require("../helpers/async-handler");
const { invitationLimiter } = require("../middlewares/rate-limit");

const router = Router();

router.get("/:token", invitationLimiter, asyncHandler(validar));

module.exports = { invitaciones: router };

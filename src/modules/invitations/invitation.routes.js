const { Router } = require("express");
const { validar } = require("./invitation.controller");
const { asyncHandler } = require("../../shared/http/async-handler");
const { invitationLimiter } = require("../../shared/middleware/rate-limit");

const router = Router();

router.get("/:token", invitationLimiter, asyncHandler(validar));

module.exports = { invitationRoutes: router };

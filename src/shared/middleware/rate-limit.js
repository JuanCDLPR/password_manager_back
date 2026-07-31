const { rateLimit } = require("express-rate-limit");
const { RESP } = require("../http/response");

const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    handler: (_req, _res, next) => next(RESP.RateLimited(message)),
  });

const authLimiter = createLimiter(
  10,
  "Demasiados intentos de autenticación; inténtalo más tarde"
);
const registerLimiter = createLimiter(
  5,
  "Demasiados intentos de registro; inténtalo más tarde"
);
const refreshLimiter = createLimiter(
  10,
  "Demasiados intentos de renovación; inténtalo más tarde"
);
const invitationLimiter = createLimiter(
  30,
  "Demasiadas consultas de invitación; inténtalo más tarde"
);

module.exports = {
  authLimiter,
  invitationLimiter,
  refreshLimiter,
  registerLimiter,
};

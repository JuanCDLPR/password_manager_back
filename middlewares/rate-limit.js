const { rateLimit } = require("express-rate-limit");
const { Respuesta } = require("../models/repuesta");

const createLimiter = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: Respuesta(429, "error", message, []),
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

module.exports = { authLimiter, refreshLimiter, registerLimiter };

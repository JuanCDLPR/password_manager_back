const REQUIRED_ENVIRONMENT_VARIABLES = ["BD_CNN", "SEED_TOKEN"];

const validateEnvironment = () => {
  const missing = REQUIRED_ENVIRONMENT_VARIABLES.filter(
    (key) => !process.env[key]?.trim()
  );

  if (missing.length > 0) {
    throw new Error(
      `Faltan variables de entorno obligatorias: ${missing.join(", ")}`
    );
  }

  if (!/^mongodb(\+srv)?:\/\//.test(process.env.BD_CNN)) {
    throw new Error("BD_CNN debe ser una cadena de conexión de MongoDB");
  }

  if (process.env.SEED_TOKEN.length < 24) {
    throw new Error("SEED_TOKEN debe tener al menos 24 caracteres");
  }

  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un puerto válido");
  }
};

const getAllowedOrigins = () =>
  (process.env.CORS_ORIGINS || "http://localhost:3021")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = { getAllowedOrigins, validateEnvironment };

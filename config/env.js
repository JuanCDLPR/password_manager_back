const REQUIRED_ENVIRONMENT_VARIABLES = [
  "BD_CNN",
  "MONGODB_DB_NAME",
  "PRODUCTION_DB_NAME",
  "SEED_TOKEN",
];
const VALID_ENVIRONMENTS = new Set(["development", "test", "production"]);

const validateDatabaseEnvironment = () => {
  const environment = process.env.NODE_ENV || "development";
  const databaseName = process.env.MONGODB_DB_NAME?.trim();
  const productionDatabaseName = process.env.PRODUCTION_DB_NAME?.trim();

  if (!VALID_ENVIRONMENTS.has(environment)) {
    throw new Error(
      "NODE_ENV debe ser development, test o production"
    );
  }

  if (environment === "production" && databaseName !== productionDatabaseName) {
    throw new Error(
      "Producción debe usar exactamente la base indicada en PRODUCTION_DB_NAME"
    );
  }

  if (environment !== "production" && databaseName === productionDatabaseName) {
    throw new Error(
      `El ambiente ${environment} no puede usar la base de producción`
    );
  }

  if (environment === "test" && !/test/i.test(databaseName)) {
    throw new Error("La base del ambiente test debe incluir 'test' en su nombre");
  }
};

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

  validateDatabaseEnvironment();

  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT debe ser un puerto válido");
  }
};

const validateMailEnvironment = () => {
  if (process.env.MAIL_ENABLED !== "true") return;

  const required = ["MAILGUN_API_KEY", "MAILGUN_DOMAIN", "MAIL_FROM"];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `MAIL_ENABLED=true requiere: ${missing.join(", ")}`
    );
  }
};

const getAllowedOrigins = () =>
  (process.env.CORS_ORIGINS || "http://localhost:3021")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

module.exports = {
  getAllowedOrigins,
  validateDatabaseEnvironment,
  validateEnvironment,
  validateMailEnvironment,
};

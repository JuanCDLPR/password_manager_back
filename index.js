const cors = require("cors");
const { config } = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");

config();

const { getAllowedOrigins, validateEnvironment } = require("./config/env");
const { dbConnection } = require("./connection/config-mongo");
const { Respuesta } = require("./models/repuesta");
const { perfil } = require("./routes/perfil.routes");
const { plataformas } = require("./routes/plataformas.routes");
const { usuarios } = require("./routes/usuarios.routes");

validateEnvironment();

const app = express();
const allowedOrigins = getAllowedOrigins();

app.disable("x-powered-by");
app.set("port", Number(process.env.PORT || 3000));

if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.use(helmet());
app.use(
  cors({
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Administracion"],
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.static("public"));

app.use("/usuarios", usuarios);
app.use("/plataformas", plataformas);
app.use("/perfil", perfil);

app.use((_req, res) =>
  res.status(404).json(Respuesta(404, "error", "Ruta no encontrada", []))
);

app.use((error, _req, res, _next) => {
  if (error?.message === "Origen no permitido por CORS") {
    return res
      .status(403)
      .json(Respuesta(403, "error", "Origen no permitido", []));
  }

  if (error?.type === "entity.too.large") {
    return res
      .status(413)
      .json(Respuesta(413, "error", "La solicitud es demasiado grande", []));
  }

  console.error("Error no controlado:", error?.name || "Error");
  return res
    .status(500)
    .json(Respuesta(500, "error", "Error interno del servidor", []));
});

let server;

const start = async () => {
  await dbConnection();
  server = app.listen(app.get("port"), () => {
    console.log(`API disponible en el puerto ${app.get("port")}`);
  });
};

const shutdown = async (signal) => {
  console.log(`Cerrando servidor por ${signal}`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.disconnect();
  process.exit(0);
};

if (require.main === module) {
  start().catch(() => process.exit(1));
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

module.exports = { app, start };

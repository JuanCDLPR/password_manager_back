const cors = require("cors");
const { config } = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const mongoose = require("mongoose");

config();

const { getAllowedOrigins, validateEnvironment } = require("./config/env");
const { dbConnection } = require("./connection/config-mongo");
const { RESP } = require("./helpers/http");
const {
  errorHandler,
  notFoundHandler,
} = require("./middlewares/error-handler");
const { requestContext } = require("./middlewares/request-context");
const { httpLogger } = require("./middlewares/http-logger");
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
app.use(requestContext);
app.use(httpLogger);
app.use(
  cors({
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Authorization", "Content-Type", "X-Request-Id"],
    exposedHeaders: ["X-Request-Id"],
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(RESP.Forbidden("Origen no permitido por CORS"));
    },
  })
);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.static("public"));

app.get("/health", (_req, res) =>
  RESP.Ok(res, { status: "ok" }, "Servicio disponible")
);

app.use("/usuarios", usuarios);
app.use("/plataformas", plataformas);
app.use("/perfil", perfil);

app.use(notFoundHandler);
app.use(errorHandler);

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

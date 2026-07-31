const cors = require("cors");
const { config } = require("dotenv");
const express = require("express");
const helmet = require("helmet");
const path = require("node:path");

config();

const {
  getAllowedOrigins,
  validateEnvironment,
  validateMailEnvironment,
} = require("./config/env");
const { RESP } = require("./shared/http/response");
const {
  errorHandler,
  notFoundHandler,
} = require("./shared/middleware/error-handler");
const { requestContext } = require("./shared/middleware/request-context");
const { httpLogger } = require("./shared/middleware/http-logger");
const { profileRoutes } = require("./modules/profile/profile.routes");
const { platformRoutes } = require("./modules/platforms/platform.routes");
const {
  invitationRoutes,
} = require("./modules/invitations/invitation.routes");
const { userRoutes } = require("./modules/users/user.routes");
const { adminRoutes } = require("./modules/admin/admin.routes");

validateEnvironment();
validateMailEnvironment();

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
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (_req, res) =>
  RESP.Ok(res, { status: "ok" }, "Servicio disponible")
);

app.use("/usuarios", userRoutes);
app.use("/invitations", invitationRoutes);
app.use("/admin", adminRoutes);
app.use("/plataformas", platformRoutes);
app.use("/perfil", profileRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };

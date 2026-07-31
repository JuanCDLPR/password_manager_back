const mongoose = require("mongoose");
const { app } = require("./app");
const { dbConnection } = require("./database/mongo");

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

module.exports = { start };

const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const { dbConnection } = require("./connection/config-mongo");

const { usuarios } = require("./routes/usuarios.routes");

config();

const app = express();

dbConnection();

app.set("port", process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/usuarios", usuarios);

app.listen(app.get("port"), () => {
  console.log("PORT ", app.get("port"));
});

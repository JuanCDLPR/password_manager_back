const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
config();
const app = express();
const { usuarios } = require("./routes/usuarios.routes");

app.set("port", process.env.PORT || 3000);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/usuarios", usuarios);

app.listen(app.get("port"), () => {
  console.log("PORT ", app.get("port"));
});

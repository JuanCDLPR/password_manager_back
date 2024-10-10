/** esto es para el autocompletado
 * @type {import('mongoose').Model<any>}
 */

const express = require("express");
const cors = require("cors");
const { config } = require("dotenv");
const { dbConnection } = require("./connection/config-mongo");

//importaciond de rutas
const { usuarios } = require("./routes/usuarios.routes");
const { plataformas } = require("./routes/plataformas.routes");
const { perfil } = require("./routes/perfil.routes");

//inicio de variables de entorno
config();

//inicio de servidor
const app = express();

//inicializacion de la base de datos
dbConnection();

//inicializacion del puerto
app.set("port", process.env.PORT || 3000);

//middelwares
app.use(cors());
app.use(express.json()); //lectura y parseo del body
app.use(express.urlencoded({ extended: true }));

// Directorio Público
app.use(express.static("public"));

//rutas
app.use("/usuarios", usuarios);
app.use("/plataformas", plataformas);
app.use("/perfil", perfil);

app.listen(app.get("port"), () => {
  console.log("PORT ", app.get("port"));
});

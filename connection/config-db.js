const mysql = require("mysql");

let connection;

try {
  connection = mysql.createConnection({
    host: process.env.DBHOST,
    user: process.env.USER,
    password: process.env.PASS,
    database: process.env.DATABASE,
  });
} catch (erro) {
  console.log("Error al conectar con la base de datos");
}
module.exports = { connection };

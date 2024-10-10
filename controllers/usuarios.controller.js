const { request, response } = require("express");
const { connection } = require("../connection/config-db");
const { Respuesta } = require("../models/repuesta");
const { Encrypt, Decrypt } = require("../helpers/encrypt-by-key");

const util = require("util");
const { generarJWT } = require("../helpers/jwt");

const registrar = (req = request, res = response) => {
  const { name, user, password } = req.body;
  console.log(req.body);

  const existeUsuario = (user, callback) => {
    connection.query(
      "SELECT * FROM USUARIOS WHERE USER = ?",
      [user],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results.length > 0);
      }
    );
  };

  const insertarUsuario = (name, user, password, callback) => {
    connection.query(
      "INSERT INTO USUARIOS (NAME, USER, PASSWORD) VALUES (?,?,?)",
      [name, user, Encrypt(password)],
      (error, results) => {
        if (error) {
          return callback(error, null);
        }
        return callback(null, results);
      }
    );
  };

  existeUsuario(user, (error, existe) => {
    if (error) {
      console.error("Error en la consulta:", error.stack);
      return res
        .status(500)
        .json(Respuesta(500, "error", "error al validar", []));
    }

    if (existe) {
      return res
        .status(400)
        .json(Respuesta(400, "error", "este usuario ya existe", []));
    }

    insertarUsuario(name, user, password, (error, results) => {
      if (error) {
        console.error("Error en la consulta:", error.stack);
        return res
          .status(500)
          .json(Respuesta(500, "error", "no se ha insertado", []));
      }

      return res
        .status(200)
        .json(Respuesta(200, "ok", "insertado correctamente", []));
    });
  });
};

const autentificarte = (req = request, res = response) => {
  const { name, user, password } = req.body;
  const query = "SELECT * FROM USUARIOS WHERE USER = ?";
  connection.query(query, [user], async (error, results, fields) => {
    if (error) {
      console.error("Error en la consulta:".error.stack);
      return res
        .status(500)
        .json(Respuesta(500, "error", "no se ha insertado", []));
    } else {
      if (password == Decrypt(results[0].PASSWORD)) {
        const token = await generarJWT(
          results[0].ID,
          results[0].USER,
          results[0].PASSWORD
        );
        const body = {
          name: results[0].NAME,
          user: results[0].USER,
          token,
        };
        return res
          .status(200)
          .json(Respuesta(200, "ok", "insertado correctamente", body));
      } else {
        return res
          .status(200)
          .json(
            Respuesta(
              500,
              "error",
              "credenciales incorrectas, verifique nuevamente",
              []
            )
          );
      }
    }
  });
};

module.exports = { registrar, autentificarte };

/* const registrar = async (req = request, res = response) => {
  const { name, user, password } = req.body;
  console.log(req.body);

  let existeRegistro = false;

  const call = (error, results, fields) => {
    if (error) {
      console.error("Error en la consulta:".error.stack);
      return res
        .status(500)
        .json(Respuesta(500, "error", "error al validar", []));
    } else {
      if (results.length > 0) {
        console.log("entro");
        existeRegistro = true;
      }
    }
  };

  const consulta = connection. query(
    "SELECT * FROM USUARIOS WHERE USER = ?",
    [user],
    call
  );
  console.log(consulta);

  console.log(existeRegistro);

  if (existeRegistro) {
    return res
      .status(200)
      .json(Respuesta(400, "error", "este usuario ya existe", []));
  }

  connection.query(
    "INSERT INTO USUARIOS (NAME, USER, PASSWORD) VALUES (?,?,?)",
    [name, user, Encrypt(password)],
    (error, results) => {
      if (error) {
        return res
          .status(500)
          .json(Respuesta(500, "error", "no se ha insertado", []));
      } else {
        return res
          .status(200)
          .json(Respuesta(200, "ok", "insertado correctamente", []));
      }
    }
  );
}; */

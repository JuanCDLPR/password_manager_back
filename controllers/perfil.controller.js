const { response, request } = require("express");
const mongoose = require("mongoose");
const { Respuesta } = require("../models/repuesta");
const UsuariosModel = require("../models/usuarios.model");
const { Encrypt, Decrypt } = require("../helpers/encrypt-by-key");
const { generarJWT } = require("../helpers/jwt");

const consultar = async (req = request, res = response) => {
  try {
    const { uid } = req;

    const DatosUsuario = await UsuariosModel.findById(uid);

    if (!DatosUsuario) {
      return res
        .status(200)
        .json(
          Respuesta(900, "OK", "No se encontro informacio del usuario", [])
        );
    }

    return res
      .status(200)
      .json(Respuesta(200, "OK", "Encontrado correctamente", [DatosUsuario]));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al consultar", []));
  }
};

const actualizar = async (req = request, res = response) => {
  try {
    const { uid } = req;
    const { nombre, usuario, url } = req.body;

    const DatosUsuario = await UsuariosModel.findOne({
      user: usuario,
      _id: { $ne: uid },
    });

    if (DatosUsuario) {
      return res
        .status(200)
        .json(Respuesta(900, "ERROR", "Ya esxiste este usuario", []));
    }

    const UsuarioActualizar = await UsuariosModel.findByIdAndUpdate(
      uid,
      { name: nombre, user: usuario, img: url, actualizado: Date.now() },
      { new: true }
    );

    return res
      .status(200)
      .json(
        Respuesta(200, "OK", "Encontrado correctamente", [UsuarioActualizar])
      );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al consultar", []));
  }
};

module.exports = {
  consultar,
  actualizar,
};

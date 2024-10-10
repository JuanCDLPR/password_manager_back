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

    const token = await generarJWT(
      UsuarioActualizar.id,
      UsuarioActualizar.user,
      UsuarioActualizar.password
    );

    const UsuarioActualizarConToken = {
      name: UsuarioActualizar.name,
      user: UsuarioActualizar.user,
      token,
    };

    return res
      .status(200)
      .json(
        Respuesta(200, "OK", "Encontrado correctamente", [
          UsuarioActualizarConToken,
        ])
      );
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al consultar", []));
  }
};

const update_pass = async (req = request, res = response) => {
  try {
    const { uid } = req;
    const { pass, rep_pass, old_pass } = req.body;

    //console.log("body", req.body);

    const DatosUsuario = await UsuariosModel.findById(uid);

    if (!DatosUsuario) {
      return res
        .status(200)
        .json(
          Respuesta(900, "OK", "No se encontro informacio del usuario", [])
        );
    }

    let UsuarioActualizar;

    if (Decrypt(DatosUsuario.password) === old_pass) {
      UsuarioActualizar = await UsuariosModel.findByIdAndUpdate(
        uid,
        { password: Encrypt(pass), actualizado: Date.now() },
        { new: true }
      );
    } else {
      return res
        .status(200)
        .json(Respuesta(900, "OK", "La informacion no es corecta", []));
    }

    const token = await generarJWT(
      UsuarioActualizar.id,
      UsuarioActualizar.user,
      UsuarioActualizar.password
    );

    return res
      .status(200)
      .json(Respuesta(200, "OK", "Actualizado correctamente", [token]));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al actualizar", []));
  }
};

module.exports = {
  consultar,
  actualizar,
  update_pass,
};

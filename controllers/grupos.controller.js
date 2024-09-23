const { response, request } = require("express");
const mongoose = require("mongoose");
const { Respuesta } = require("../models/repuesta");
const GruposModel = require("../models/grupos.model");

const insertar = async (req = request, res = response) => {
  try {
    const { uid } = req;
    const { nombre, acron } = req.body;

    const NewGrupo = new GruposModel({
      id_usuario: uid,
      name: nombre,
      acronimo: acron,
    });

    await NewGrupo.save();

    return res
      .status(200)
      .json(Respuesta(200, "OK", "insertado correctamente", []));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al insertar", []));
  }
};

const listar = async (req = request, res = response) => {
  try {
    //console.log(req.query);
    const { Order, query } = req.query;
    const { uid } = req;

    let ordenamiento = {};

    switch (Number(Order)) {
      case 1:
        ordenamiento = { fecha: -1 };
        break;
      case 2:
        ordenamiento = { fecha: 1 };
        break;
      case 3:
        ordenamiento = { name: -1 };
        break;
      case 4:
        ordenamiento = { name: 1 };
        break;
      default:
        break;
    }

    const query_find =
      query !== ""
        ? { name: { $regex: query, $options: "i" }, id_usuario: uid }
        : { id_usuario: uid };

    const DataGrupo = await GruposModel.find(query_find).sort(ordenamiento);

    return res
      .status(200)
      .json(Respuesta(200, "OK", "obtenidos correctamente", DataGrupo));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al consultar", []));
  }
};

const eliminar = async (req = request, res = response) => {
  try {
    const { ID } = req.query;

    const RegistroAEliminar = await GruposModel.findById(ID);

    if (!RegistroAEliminar) {
      return res
        .status(200)
        .json(
          Respuesta(900, "OK", "No se encontro la plataforma a eliminar", [])
        );
    }

    await GruposModel.findByIdAndDelete(RegistroAEliminar._id);

    return res
      .status(200)
      .json(Respuesta(200, "OK", "Eliminado correctamente", []));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al eliminar", []));
  }
};

const consultar = async (req = request, res = response) => {
  try {
    const { ID } = req.query;

    const DatosGrupo = await GruposModel.findById(ID);

    if (!DatosGrupo) {
      return res
        .status(200)
        .json(
          Respuesta(900, "OK", "No se encontro informacio de la plataforma", [])
        );
    }

    return res
      .status(200)
      .json(Respuesta(200, "OK", "Eliminado correctamente", [DatosGrupo]));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al eliminar", []));
  }
};

const actualizar = async (req = request, res = response) => {
  try {
    const { id, nombre, acron } = req.body;

    const GrupoActualizado = await GruposModel.findByIdAndUpdate(
      id,
      { name: nombre, acronimo: acron, actualizado: Date.now() },
      { new: true }
    );

    if (!GrupoActualizado) {
      return res
        .status(200)
        .json(
          Respuesta(
            900,
            "OK",
            "No se encontro informacion de la plataforma",
            []
          )
        );
    }

    return res
      .status(200)
      .json(Respuesta(200, "OK", "Actualizado correctamente", []));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al eliminar", []));
  }
};

module.exports = {
  insertar,
  listar,
  eliminar,
  consultar,
  actualizar,
};

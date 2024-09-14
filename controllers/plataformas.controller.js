const { response, request } = require("express");
const mongoose = require("mongoose");
const { Respuesta } = require("../models/repuesta");
const PlataformasModel = require("../models/plataformas.model");

const insertar = async (req = request, res = response) => {
  try {
    const { nombre, url } = req.body;

    const NewPlataforma = new PlataformasModel({
      name: nombre,
      url: url,
    });

    await NewPlataforma.save();

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
      query !== "" ? { name: { $regex: query, $options: "i" } } : {};

    const DataPlataformas = await PlataformasModel.find(query_find).sort(
      ordenamiento
    );

    return res
      .status(200)
      .json(Respuesta(200, "OK", "obtenidos correctamente", DataPlataformas));
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

    const RegistroAEliminar = await PlataformasModel.findById(ID);

    if (!RegistroAEliminar) {
      return res
        .status(200)
        .json(
          Respuesta(900, "OK", "No se encontro la plataforma a eliminar", [])
        );
    }

    await PlataformasModel.findByIdAndDelete(RegistroAEliminar._id);

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

    const DatosPlataforma = await PlataformasModel.findById(ID);

    if (!DatosPlataforma) {
      return res
        .status(200)
        .json(
          Respuesta(900, "OK", "No se encontro informacio de la plataforma", [])
        );
    }

    return res
      .status(200)
      .json(Respuesta(200, "OK", "Eliminado correctamente", [DatosPlataforma]));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al eliminar", []));
  }
};

const actualizar = async (req = request, res = response) => {
  try {
    const { id, nombre, url } = req.body;

    const PlataformaActualizada = await PlataformasModel.findByIdAndUpdate(
      id,
      { name: nombre, url: url, actualizado: Date.now() },
      { new: true }
    );

    if (!PlataformaActualizada) {
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

module.exports = { insertar, listar, eliminar, consultar, actualizar };

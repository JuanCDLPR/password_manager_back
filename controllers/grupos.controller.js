const { response, request } = require("express");
const mongoose = require("mongoose");
const { Respuesta } = require("../models/repuesta");
const GruposSchema = require("../models/grupos.model");

const insertar = async (req = request, res = response) => {
  try {
    const { uid } = req;
    const { nombre, acron } = req.body;

    const NewGrupo = new GruposSchema({
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

    const DataGrupo = await GruposSchema.find(query_find).sort(ordenamiento);

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

module.exports = {
  insertar,
  listar,
};

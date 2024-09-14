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

    return res.status(200).json(Respuesta(200, "OK", "", []));
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json(Respuesta(500, "ERROR", "Error al insertar", []));
  }
};

module.exports = { insertar };

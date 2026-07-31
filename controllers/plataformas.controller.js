const { request, response } = require("express");
const mongoose = require("mongoose");
const {
  cleanString,
  isValidOptionalHttpUrl,
} = require("../helpers/validation");
const PlataformasModel = require("../models/plataformas.model");
const { Respuesta } = require("../models/repuesta");

const validarDatos = (nombre, url) =>
  nombre.length >= 1 &&
  nombre.length <= 100 &&
  isValidOptionalHttpUrl(url);

const insertar = async (req = request, res = response) => {
  const nombre = cleanString(req.body.nombre);
  const url = cleanString(req.body.url);

  if (!validarDatos(nombre, url)) {
    return res
      .status(400)
      .json(Respuesta(400, "error", "Los datos de la plataforma no son válidos", []));
  }

  try {
    await PlataformasModel.create({
      id_usuario: req.uid,
      name: nombre,
      url,
    });

    return res
      .status(201)
      .json(Respuesta(201, "ok", "Plataforma creada correctamente", []));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible crear la plataforma", []));
  }
};

const listar = async (req = request, res = response) => {
  const order = Number(req.query.Order);
  const search = cleanString(req.query.query).slice(0, 100);
  const sortOptions = {
    1: { fecha: -1 },
    2: { fecha: 1 },
    3: { name: -1 },
    4: { name: 1 },
  };

  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = {
    id_usuario: req.uid,
    ...(search && { name: { $regex: escapedSearch, $options: "i" } }),
  };

  try {
    const plataformas = await PlataformasModel.find(filter)
      .select("-id_usuario")
      .sort(sortOptions[order] || { fecha: -1 });

    return res
      .status(200)
      .json(Respuesta(200, "ok", "Plataformas obtenidas", plataformas));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible consultar las plataformas", []));
  }
};

const eliminar = async (req = request, res = response) => {
  const { ID } = req.query;
  if (!mongoose.isValidObjectId(ID)) {
    return res
      .status(400)
      .json(Respuesta(400, "error", "Identificador no válido", []));
  }

  try {
    const plataforma = await PlataformasModel.findOneAndDelete({
      _id: ID,
      id_usuario: req.uid,
    });

    if (!plataforma) {
      return res
        .status(404)
        .json(Respuesta(404, "error", "No se encontró la plataforma", []));
    }

    return res
      .status(200)
      .json(Respuesta(200, "ok", "Plataforma eliminada", []));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible eliminar la plataforma", []));
  }
};

const consultar = async (req = request, res = response) => {
  const { ID } = req.query;
  if (!mongoose.isValidObjectId(ID)) {
    return res
      .status(400)
      .json(Respuesta(400, "error", "Identificador no válido", []));
  }

  try {
    const plataforma = await PlataformasModel.findOne({
      _id: ID,
      id_usuario: req.uid,
    }).select("-id_usuario");

    if (!plataforma) {
      return res
        .status(404)
        .json(Respuesta(404, "error", "No se encontró la plataforma", []));
    }

    return res
      .status(200)
      .json(Respuesta(200, "ok", "Plataforma encontrada", [plataforma]));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible consultar la plataforma", []));
  }
};

const actualizar = async (req = request, res = response) => {
  const id = req.body.id;
  const nombre = cleanString(req.body.nombre);
  const url = cleanString(req.body.url);

  if (!mongoose.isValidObjectId(id) || !validarDatos(nombre, url)) {
    return res
      .status(400)
      .json(Respuesta(400, "error", "Los datos de la plataforma no son válidos", []));
  }

  try {
    const plataforma = await PlataformasModel.findOneAndUpdate(
      { _id: id, id_usuario: req.uid },
      { name: nombre, url, actualizado: new Date() },
      { new: true, runValidators: true }
    );

    if (!plataforma) {
      return res
        .status(404)
        .json(Respuesta(404, "error", "No se encontró la plataforma", []));
    }

    return res
      .status(200)
      .json(Respuesta(200, "ok", "Plataforma actualizada", []));
  } catch {
    return res
      .status(500)
      .json(Respuesta(500, "error", "No fue posible actualizar la plataforma", []));
  }
};

module.exports = { actualizar, consultar, eliminar, insertar, listar };

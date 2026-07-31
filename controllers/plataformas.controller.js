const mongoose = require("mongoose");
const { RESP } = require("../helpers/http");
const {
  cleanString,
  isValidOptionalHttpUrl,
} = require("../helpers/validation");
const PlataformasModel = require("../models/plataformas.model");

const validarDatos = (nombre, url) =>
  nombre.length >= 1 &&
  nombre.length <= 100 &&
  isValidOptionalHttpUrl(url);

const serialize = (plataforma) => ({
  _id: plataforma.id,
  name: plataforma.name,
  url: plataforma.url,
  fecha: plataforma.fecha,
  actualizado: plataforma.actualizado,
});

const insertar = async (req, res) => {
  const nombre = cleanString(req.body.nombre);
  const url = cleanString(req.body.url);

  if (!validarDatos(nombre, url)) {
    throw RESP.Validation(
      "Los datos de la plataforma no son válidos",
      { fields: ["nombre", "url"] }
    );
  }

  const plataforma = await PlataformasModel.create({
    id_usuario: req.uid,
    name: nombre,
    url,
  });

  return RESP.Created(
    res,
    serialize(plataforma),
    "Plataforma creada correctamente"
  );
};

const listar = async (req, res) => {
  const order = Number(req.query.order);
  const search = cleanString(req.query.search).slice(0, 100);
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

  const plataformas = await PlataformasModel.find(filter)
    .select("-id_usuario")
    .sort(sortOptions[order] || { fecha: -1 });

  return RESP.Ok(
    res,
    plataformas,
    "Plataformas obtenidas",
    { count: plataformas.length }
  );
};

const findOwnedPlatform = async (id, userId) => {
  if (!mongoose.isValidObjectId(id)) {
    throw RESP.InvalidIdentifier(
      "El identificador no es válido",
      { fields: ["id"] }
    );
  }

  const plataforma = await PlataformasModel.findOne({
    _id: id,
    id_usuario: userId,
  }).select("-id_usuario");

  if (!plataforma) {
    throw RESP.NotFound("No se encontró la plataforma");
  }

  return plataforma;
};

const consultar = async (req, res) => {
  const plataforma = await findOwnedPlatform(req.params.id, req.uid);
  return RESP.Ok(res, plataforma, "Plataforma encontrada");
};

const actualizar = async (req, res) => {
  const nombre = cleanString(req.body.nombre);
  const url = cleanString(req.body.url);

  if (!mongoose.isValidObjectId(req.params.id) || !validarDatos(nombre, url)) {
    throw RESP.Validation(
      "Los datos de la plataforma no son válidos",
      { fields: ["id", "nombre", "url"] }
    );
  }

  const plataforma = await PlataformasModel.findOneAndUpdate(
    { _id: req.params.id, id_usuario: req.uid },
    { name: nombre, url, actualizado: new Date() },
    { new: true, runValidators: true }
  );

  if (!plataforma) {
    throw RESP.NotFound("No se encontró la plataforma");
  }

  return RESP.Ok(res, serialize(plataforma), "Plataforma actualizada");
};

const eliminar = async (req, res) => {
  await findOwnedPlatform(req.params.id, req.uid);
  await PlataformasModel.deleteOne({
    _id: req.params.id,
    id_usuario: req.uid,
  });
  return RESP.NoContent(res);
};

module.exports = { actualizar, consultar, eliminar, insertar, listar };

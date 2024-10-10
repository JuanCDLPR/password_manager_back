function Respuesta(codigo = "", estatus = "", mensaje = "", data = "") {
  return {
    codigo,
    estatus,
    mensaje,
    data,
  };
}

module.exports = {
  Respuesta,
};

const { Schema, model } = require("mongoose");

const PlataformasSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: false,
  },
});

module.exports = model("PLATAFORMAS", PlataformasSchema);

const { Schema, model } = require("mongoose");

const PlatformSchema = new Schema(
  {
    id_usuario: {
      type: Schema.Types.ObjectId,
      ref: "USUARIOS",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    url: {
      type: String,
      default: "",
      maxlength: 2048,
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    actualizado: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

PlatformSchema.index({ id_usuario: 1, name: 1 });

module.exports = model("PLATAFORMAS", PlatformSchema);

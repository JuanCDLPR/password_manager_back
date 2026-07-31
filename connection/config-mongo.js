const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.BD_CNN, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("DB Online");
  } catch (error) {
    console.error("No fue posible conectar con MongoDB");
    throw new Error("Error al inicializar la base de datos");
  }
};

module.exports = {
  dbConnection,
};

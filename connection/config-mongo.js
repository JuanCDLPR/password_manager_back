const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.BD_CNN, {
      dbName: process.env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      `DB Online: ${process.env.MONGODB_DB_NAME} (${process.env.NODE_ENV})`
    );
  } catch (error) {
    console.error("No fue posible conectar con MongoDB");
    throw new Error("Error al inicializar la base de datos");
  }
};

module.exports = {
  dbConnection,
};

const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");
const bcrypt = require("bcryptjs");
const { config } = require("dotenv");
const mongoose = require("mongoose");

config();

const { validateEnvironment } = require("../config/env");
const { dbConnection } = require("../connection/config-mongo");
const {
  cleanString,
  isValidEmail,
  isValidName,
  isValidPassword,
  isValidUser,
  normalizeEmail,
  normalizeUser,
} = require("../helpers/validation");
const UsuariosModel = require("../models/usuarios.model");

const askHidden = (question) => {
  if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
    return Promise.resolve(process.env.BOOTSTRAP_ADMIN_PASSWORD || "");
  }

  stdout.write(question);
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise((resolve, reject) => {
    let value = "";

    const cleanup = () => {
      stdin.removeListener("data", onData);
      stdin.setRawMode(false);
      stdin.pause();
      stdout.write("\n");
    };

    const onData = (chunk) => {
      const key = chunk.toString("utf8");

      if (key === "\u0003") {
        cleanup();
        reject(new Error("Operación cancelada"));
        return;
      }

      if (key === "\r" || key === "\n") {
        cleanup();
        resolve(value);
        return;
      }

      if (key === "\u007f" || key === "\b") {
        if (value.length > 0) {
          value = value.slice(0, -1);
          stdout.write("\b \b");
        }
        return;
      }

      if (/^[\x20-\x7E]+$/.test(key)) {
        value += key;
        stdout.write("*".repeat(key.length));
      }
    };

    stdin.on("data", onData);
  });
};

const run = async () => {
  validateEnvironment();
  await dbConnection();

  const existingAdmin = await UsuariosModel.exists({ role: "superadmin" });
  if (existingAdmin) {
    throw new Error(
      "Ya existe un superadministrador; no se modificó ninguna cuenta"
    );
  }

  const prompt = readline.createInterface({ input: stdin, output: stdout });
  const name = cleanString(await prompt.question("Nombre: "));
  const email = normalizeEmail(await prompt.question("Correo: "));
  const user = normalizeUser(await prompt.question("Usuario: "));

  if (process.env.NODE_ENV === "production") {
    const confirmation = cleanString(
      await prompt.question(
        `Escribe ${process.env.MONGODB_DB_NAME} para confirmar la base: `
      )
    );
    if (confirmation !== process.env.MONGODB_DB_NAME) {
      prompt.close();
      throw new Error("La confirmación de la base no coincide");
    }
  }

  prompt.close();
  const password = await askHidden("Contraseña (12-128 caracteres): ");

  const invalidFields = [
    ...(!isValidName(name) ? ["name"] : []),
    ...(!isValidEmail(email) ? ["email"] : []),
    ...(!isValidUser(user) ? ["user"] : []),
    ...(!isValidPassword(password) ? ["password"] : []),
  ];
  if (invalidFields.length > 0) {
    throw new Error(`Campos no válidos: ${invalidFields.join(", ")}`);
  }

  await UsuariosModel.create({
    name,
    email,
    user,
    password: await bcrypt.hash(password, 12),
    role: "superadmin",
    status: "active",
  });

  console.log(`Superadministrador creado en ${process.env.MONGODB_DB_NAME}`);
};

run()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

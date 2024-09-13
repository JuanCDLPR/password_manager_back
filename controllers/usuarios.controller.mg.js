const mongoose = require("mongoose");
const { Respuesta } = require("../models/repuesta");
const UsuariosModel = require("../models/usuarios.model");
const { Encrypt, Decrypt } = require("../helpers/encrypt-by-key");
const { generarJWT } = require("../helpers/jwt");

const registrar = async (req = request, res = response) => {
  const { name, user, password } = req.body;

  const query = { user: user };

  try {
    const FindUserRegister = await UsuariosModel.findOne(query);

    if (FindUserRegister) {
      //console.log(FindUserRegister);
      return res
        .status(400)
        .json(Respuesta(400, "error", "este usuario ya existe", []));
    }

    const NewUser = new UsuariosModel({
      name,
      user,
      password,
    });

    NewUser.password = Encrypt(password);

    //console.log(NewUser.id);

    await NewUser.save();

    return res
      .status(200)
      .json(Respuesta(200, "ok", "Usuario registrado correctamene", []));
  } catch (error) {
    return res
      .status(500)
      .json(Respuesta(500, "error", "error al registrar usuario", []));
  }
};

const autentificarte = async (req = request, res = response) => {
  const { user, password } = req.body;

  const UserRegister = await UsuariosModel.findOne({ user });

  if (!UserRegister) {
    return res
      .status(200)
      .json(
        Respuesta(
          403,
          "error",
          "credenciales incorrectas, verifique nuevamente",
          []
        )
      );
  }

  if (password === Decrypt(UserRegister.password)) {
    const token = await generarJWT(
      UserRegister.id,
      UserRegister.user,
      UserRegister.password
    );

    const body = {
      name: UserRegister.name,
      user: UserRegister.user,
      token,
    };

    return res
      .status(200)
      .json(Respuesta(200, "ok", "insertado correctamente", body));
  } else {
    return res
      .status(200)
      .json(
        Respuesta(
          403,
          "error",
          "credenciales incorrectas, verifique nuevamente",
          []
        )
      );
  }
};

module.exports = {
  registrar,
  autentificarte,
};

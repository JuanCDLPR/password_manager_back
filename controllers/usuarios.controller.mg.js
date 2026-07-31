const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { generarJWT } = require("../helpers/jwt");
const { RESP } = require("../helpers/http");
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
const InvitacionesModel = require("../models/invitaciones.model");
const {
  hashInvitationToken,
  isValidInvitationToken,
} = require("../services/invitation.service");

const registrar = async (req, res) => {
  const name = cleanString(req.body.name);
  const user = normalizeUser(req.body.user);
  const email = normalizeEmail(req.body.email);
  const { password } = req.body;
  const invitationToken = cleanString(req.body.invitationToken);

  const invalidFields = [
    ...(!isValidName(name) ? ["name"] : []),
    ...(!isValidUser(user) ? ["user"] : []),
    ...(!isValidEmail(email) ? ["email"] : []),
    ...(!isValidPassword(password) ? ["password"] : []),
    ...(!isValidInvitationToken(invitationToken)
      ? ["invitationToken"]
      : []),
  ];

  if (invalidFields.length) {
    throw RESP.Validation(
      "Nombre, usuario, correo, contraseña o invitación no cumplen el formato requerido",
      { fields: invalidFields }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const now = new Date();

  await mongoose.connection.transaction(async (session) => {
    const invitation = await InvitacionesModel.findOne({
      tokenHash: hashInvitationToken(invitationToken),
      email,
      status: "pending",
      expiresAt: { $gt: now },
    }).session(session);

    if (!invitation) throw RESP.InvitationInvalid();

    const [usuario] = await UsuariosModel.create(
      [
        {
          name,
          user,
          email,
          password: passwordHash,
          role: "user",
          status: "active",
          emailVerifiedAt: now,
        },
      ],
      { session }
    );

    const consumed = await InvitacionesModel.updateOne(
      {
        _id: invitation.id,
        status: "pending",
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: "used",
          consumedAt: now,
          consumedBy: usuario.id,
        },
        $unset: { activeEmail: 1 },
      },
      { session }
    );

    if (consumed.modifiedCount !== 1) throw RESP.InvitationInvalid();
  });

  return RESP.Created(res, null, "Usuario registrado correctamente");
};

const autentificarte = async (req, res) => {
  const login = cleanString(req.body.login ?? req.body.user);
  const { password } = req.body;
  const loginIsEmail = login.includes("@");
  const normalizedLogin = loginIsEmail
    ? normalizeEmail(login)
    : normalizeUser(login);
  const validLogin = loginIsEmail
    ? isValidEmail(normalizedLogin)
    : isValidUser(normalizedLogin);

  if (!validLogin || typeof password !== "string") {
    throw RESP.Validation("Usuario o correo y contraseña son obligatorios");
  }

  const query = loginIsEmail
    ? { email: normalizedLogin }
    : { user: normalizedLogin };
  const usuario = await UsuariosModel.findOne(query).select(
    "+password +tokenVersion"
  );
  const passwordValido =
    usuario && (await bcrypt.compare(password, usuario.password));

  if (!passwordValido) {
    throw RESP.InvalidCredentials();
  }

  if (usuario.status === "disabled") {
    throw RESP.AccountDisabled();
  }

  usuario.lastLoginAt = new Date();
  await usuario.save();

  const token = await generarJWT(usuario.id, usuario.tokenVersion);
  return RESP.Ok(
    res,
    {
      name: usuario.name,
      user: usuario.user,
      email: usuario.email || null,
      role: usuario.role,
      token,
    },
    "Autenticación correcta"
  );
};

const obtenerSesion = async (req, res) => {
  const usuario = await UsuariosModel.findById(req.uid);
  if (!usuario) throw RESP.SessionInvalid();

  return RESP.Ok(
    res,
    {
      id: usuario.id,
      name: usuario.name,
      user: usuario.user,
      email: usuario.email || null,
      role: usuario.role,
      status: usuario.status,
      emailVerifiedAt: usuario.emailVerifiedAt,
      lastLoginAt: usuario.lastLoginAt,
    },
    "Sesión vigente"
  );
};

const refrescarToken = async (req, res) => {
  const { password } = req.body;

  if (typeof password !== "string") {
    throw RESP.Validation(
      "La contraseña es obligatoria",
      { fields: ["password"] }
    );
  }

  const usuario = await UsuariosModel.findById(req.uid).select(
    "+password +tokenVersion"
  );

  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw RESP.InvalidCredentials("La contraseña no es correcta");
  }

  const token = await generarJWT(usuario.id, usuario.tokenVersion);
  return RESP.Ok(res, { token }, "Sesión renovada correctamente");
};

module.exports = {
  autentificarte,
  obtenerSesion,
  refrescarToken,
  registrar,
};

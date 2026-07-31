const mongoose = require("mongoose");
const { RESP } = require("../helpers/http");
const {
  cleanString,
  isValidEmail,
  isValidName,
  normalizeEmail,
} = require("../helpers/validation");
const InvitacionesModel = require("../models/invitaciones.model");
const UsuariosModel = require("../models/usuarios.model");
const {
  buildInvitationUrl,
  createInvitationToken,
  getInvitationExpiration,
  hashInvitationToken,
  isValidInvitationToken,
} = require("../services/invitation.service");
const { sendInvitationEmail } = require("../services/mail.service");

const VALID_STATUSES = new Set(["pending", "used", "revoked", "expired"]);

const serializeInvitation = (invitation) => ({
  id: invitation.id,
  email: invitation.email,
  invitedName: invitation.invitedName,
  status: invitation.status,
  expiresAt: invitation.expiresAt,
  deliveryStatus: invitation.deliveryStatus,
  lastDeliveryAt: invitation.lastDeliveryAt,
  consumedAt: invitation.consumedAt,
  revokedAt: invitation.revokedAt,
  createdAt: invitation.createdAt,
  createdBy:
    invitation.createdBy?.name !== undefined
      ? {
          id: invitation.createdBy.id,
          name: invitation.createdBy.name,
          user: invitation.createdBy.user,
        }
      : invitation.createdBy,
});

const expirePendingInvitations = (filter = {}) =>
  InvitacionesModel.updateMany(
    {
      ...filter,
      status: "pending",
      expiresAt: { $lte: new Date() },
    },
    {
      $set: { status: "expired" },
      $unset: { activeEmail: 1 },
    }
  );

const deliverInvitation = async (invitation, token, inviterName) => {
  try {
    await sendInvitationEmail({
      to: invitation.email,
      invitedName: invitation.invitedName,
      inviterName,
      invitationUrl: buildInvitationUrl(token),
      expiresAt: invitation.expiresAt,
    });
    invitation.deliveryStatus = "sent";
    invitation.lastDeliveryAt = new Date();
    await invitation.save();
  } catch {
    invitation.deliveryStatus = "failed";
    invitation.lastDeliveryAt = new Date();
    await invitation.save();
    throw RESP.EmailDeliveryFailed(undefined, {
      invitationId: invitation.id,
    });
  }
};

const crear = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const invitedName = cleanString(req.body.invitedName);

  const invalidFields = [
    ...(!isValidEmail(email) ? ["email"] : []),
    ...(!isValidName(invitedName) ? ["invitedName"] : []),
  ];
  if (invalidFields.length > 0) {
    throw RESP.Validation("Los datos de la invitación no son válidos", {
      fields: invalidFields,
    });
  }

  if (await UsuariosModel.exists({ email })) {
    throw RESP.Conflict("Ya existe una cuenta con ese correo");
  }

  await expirePendingInvitations({ email });
  if (await InvitacionesModel.exists({ activeEmail: email })) {
    throw RESP.Conflict("Ya existe una invitación pendiente para ese correo");
  }

  const token = createInvitationToken();
  const invitation = await InvitacionesModel.create({
    email,
    invitedName,
    tokenHash: hashInvitationToken(token),
    activeEmail: email,
    expiresAt: getInvitationExpiration(),
    createdBy: req.uid,
  });

  await deliverInvitation(invitation, token, req.auth.name);
  return RESP.Created(
    res,
    serializeInvitation(invitation),
    "Invitación creada y enviada"
  );
};

const listar = async (req, res) => {
  await expirePendingInvitations();

  const requestedStatus = cleanString(req.query.status);
  const search = cleanString(req.query.search).slice(0, 100);
  const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = {
    ...(VALID_STATUSES.has(requestedStatus) && { status: requestedStatus }),
    ...(search && {
      $or: [
        { email: { $regex: escapedSearch, $options: "i" } },
        { invitedName: { $regex: escapedSearch, $options: "i" } },
      ],
    }),
  };

  const invitations = await InvitacionesModel.find(filter)
    .populate("createdBy", "name user")
    .sort({ createdAt: -1 })
    .limit(200);

  return RESP.Ok(
    res,
    invitations.map(serializeInvitation),
    "Invitaciones obtenidas",
    { count: invitations.length }
  );
};

const getPendingInvitation = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw RESP.InvalidIdentifier();
  await expirePendingInvitations({ _id: id });

  const invitation = await InvitacionesModel.findOne({
    _id: id,
    status: "pending",
  });
  if (!invitation) throw RESP.InvitationInvalid();
  return invitation;
};

const reenviar = async (req, res) => {
  const invitation = await getPendingInvitation(req.params.id);
  const token = createInvitationToken();

  invitation.tokenHash = hashInvitationToken(token);
  invitation.expiresAt = getInvitationExpiration();
  invitation.deliveryStatus = "pending";
  await invitation.save();

  await deliverInvitation(invitation, token, req.auth.name);
  return RESP.Ok(
    res,
    serializeInvitation(invitation),
    "Invitación renovada y reenviada"
  );
};

const revocar = async (req, res) => {
  const invitation = await getPendingInvitation(req.params.id);
  invitation.status = "revoked";
  invitation.revokedAt = new Date();
  invitation.revokedBy = req.uid;
  invitation.activeEmail = undefined;
  await invitation.save();
  return RESP.NoContent(res);
};

const validar = async (req, res) => {
  const { token } = req.params;
  if (!isValidInvitationToken(token)) throw RESP.InvitationInvalid();

  const invitation = await InvitacionesModel.findOne({
    tokenHash: hashInvitationToken(token),
    status: "pending",
    expiresAt: { $gt: new Date() },
  });
  if (!invitation) throw RESP.InvitationInvalid();

  return RESP.Ok(
    res,
    {
      email: invitation.email,
      invitedName: invitation.invitedName,
      expiresAt: invitation.expiresAt,
    },
    "Invitación válida"
  );
};

module.exports = { crear, listar, reenviar, revocar, validar };

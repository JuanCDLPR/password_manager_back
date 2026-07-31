const { HTTP_ERRORS, HTTP_SUCCESS } = require("./catalog");

class HttpError extends Error {
  constructor({ status, code, message, details }) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const createError = (type, message, details) => {
  const definition = HTTP_ERRORS[type];
  if (!definition) {
    throw new Error(`El error "${type}" no existe en el catálogo HTTP`);
  }

  return new HttpError({
    ...definition,
    message: message || definition.message,
    details,
  });
};

const send = (res, status, data, message, meta) => {
  const payload = { success: true, message, data };
  if (meta !== undefined) payload.meta = meta;
  return res.status(status).json(payload);
};

const RESP = Object.freeze({
  Error: createError,
  AccountDisabled: (message, details) =>
    createError("ACCOUNT_DISABLED", message, details),
  AuthRequired: (message, details) =>
    createError("AUTH_REQUIRED", message, details),
  Conflict: (message, details) => createError("CONFLICT", message, details),
  EmailDeliveryFailed: (message, details) =>
    createError("EMAIL_DELIVERY_FAILED", message, details),
  Forbidden: (message, details) => createError("FORBIDDEN", message, details),
  Internal: (message, details) =>
    createError("INTERNAL_ERROR", message, details),
  InvalidCredentials: (message, details) =>
    createError("INVALID_CREDENTIALS", message, details),
  InvalidJson: (message, details) =>
    createError("INVALID_JSON", message, details),
  InvitationInvalid: (message, details) =>
    createError("INVITATION_INVALID", message, details),
  InvalidIdentifier: (message, details) =>
    createError("INVALID_IDENTIFIER", message, details),
  NotFound: (message, details) => createError("NOT_FOUND", message, details),
  RateLimited: (message, details) =>
    createError("RATE_LIMITED", message, details),
  RequestTooLarge: (message, details) =>
    createError("REQUEST_TOO_LARGE", message, details),
  RoleRequired: (message, details) =>
    createError("ROLE_REQUIRED", message, details),
  SessionInvalid: (message, details) =>
    createError("SESSION_INVALID", message, details),
  Validation: (message, details) =>
    createError("VALIDATION_ERROR", message, details),

  Ok: (res, data = null, message = "Operación completada", meta) =>
    send(res, HTTP_SUCCESS.OK, data, message, meta),
  Created: (res, data = null, message = "Recurso creado") =>
    send(res, HTTP_SUCCESS.CREATED, data, message),
  NoContent: (res) => res.status(HTTP_SUCCESS.NO_CONTENT).send(),
});

module.exports = { HttpError, RESP };

const HTTP_ERRORS = Object.freeze({
  ACCOUNT_DISABLED: {
    status: 403,
    code: "ACCOUNT_DISABLED",
    message: "La cuenta está desactivada",
  },
  AUTH_REQUIRED: {
    status: 401,
    code: "AUTH_REQUIRED",
    message: "Se requiere autenticación",
  },
  CONFLICT: {
    status: 409,
    code: "CONFLICT",
    message: "El recurso ya existe",
  },
  FORBIDDEN: {
    status: 403,
    code: "FORBIDDEN",
    message: "No tienes permisos para realizar esta operación",
  },
  INTERNAL_ERROR: {
    status: 500,
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor",
  },
  EMAIL_DELIVERY_FAILED: {
    status: 502,
    code: "EMAIL_DELIVERY_FAILED",
    message: "El proveedor de correo no pudo aceptar el mensaje",
  },
  INVALID_CREDENTIALS: {
    status: 401,
    code: "INVALID_CREDENTIALS",
    message: "Credenciales incorrectas",
  },
  INVALID_JSON: {
    status: 400,
    code: "INVALID_JSON",
    message: "El cuerpo JSON no es válido",
  },
  INVITATION_INVALID: {
    status: 410,
    code: "INVITATION_INVALID",
    message: "La invitación no existe, expiró o ya fue utilizada",
  },
  INVALID_IDENTIFIER: {
    status: 400,
    code: "INVALID_IDENTIFIER",
    message: "El identificador no es válido",
  },
  NOT_FOUND: {
    status: 404,
    code: "NOT_FOUND",
    message: "No se encontró el recurso",
  },
  RATE_LIMITED: {
    status: 429,
    code: "RATE_LIMITED",
    message: "Demasiadas solicitudes; inténtalo más tarde",
  },
  ROLE_REQUIRED: {
    status: 403,
    code: "ROLE_REQUIRED",
    message: "No tienes el rol necesario para realizar esta operación",
  },
  REQUEST_TOO_LARGE: {
    status: 413,
    code: "REQUEST_TOO_LARGE",
    message: "La solicitud es demasiado grande",
  },
  SESSION_INVALID: {
    status: 401,
    code: "SESSION_INVALID",
    message: "La sesión no es válida o expiró",
  },
  VALIDATION_ERROR: {
    status: 422,
    code: "VALIDATION_ERROR",
    message: "Uno o más campos no son válidos",
  },
});

const HTTP_SUCCESS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
});

module.exports = { HTTP_ERRORS, HTTP_SUCCESS };

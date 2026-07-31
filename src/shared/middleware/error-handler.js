const { HttpError, RESP } = require("../http/response");

const notFoundHandler = (req, _res, next) =>
  next(RESP.NotFound(`No existe la ruta ${req.method} ${req.originalUrl}`));

const normalizeError = (error) => {
  if (error instanceof HttpError) return error;

  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return RESP.InvalidJson();
  }

  if (error?.type === "entity.too.large") {
    return RESP.RequestTooLarge();
  }

  if (error?.name === "ValidationError") {
    const fields = Object.values(error.errors || {}).map((item) => ({
      field: item.path,
      message: item.message,
    }));
    return RESP.Validation(undefined, { fields });
  }

  if (error?.name === "CastError") {
    return RESP.InvalidIdentifier();
  }

  if (error?.code === 11000) {
    return RESP.Conflict(undefined, {
      fields: Object.keys(error.keyPattern || {}),
    });
  }

  return RESP.Internal();
};

const errorHandler = (error, req, res, _next) => {
  const normalized = normalizeError(error);

  if (normalized.status >= 500) {
    console.error(`[${req.requestId}]`, error?.name || "Error");
  }

  res.locals.errorCode = normalized.code;

  const payload = {
    success: false,
    error: {
      code: normalized.code,
      message: normalized.message,
      requestId: req.requestId,
    },
  };

  if (normalized.details !== undefined) {
    payload.error.details = normalized.details;
  }

  return res.status(normalized.status).json(payload);
};

module.exports = { errorHandler, notFoundHandler };

const { RESP } = require("../helpers/http");

const requireRole = (...allowedRoles) => (req, _res, next) => {
  if (!req.auth) {
    return next(RESP.AuthRequired());
  }

  if (!allowedRoles.includes(req.auth.role)) {
    return next(RESP.RoleRequired());
  }

  return next();
};

module.exports = { requireRole };

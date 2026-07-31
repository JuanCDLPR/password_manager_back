const { randomUUID } = require("crypto");

const requestContext = (req, res, next) => {
  req.requestId = req.header("X-Request-Id") || randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
};

module.exports = { requestContext };

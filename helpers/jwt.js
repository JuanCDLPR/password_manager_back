const jwt = require("jsonwebtoken");

const TOKEN_OPTIONS = {
  audience: "password-manager-web",
  issuer: "password-manager-api",
};

const generarJWT = (id, tokenVersion = 0) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      { ver: tokenVersion },
      process.env.SEED_TOKEN,
      {
        ...TOKEN_OPTIONS,
        expiresIn: process.env.JWT_EXPIRES_IN || "6h",
        subject: id.toString(),
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
};

module.exports = {
  generarJWT,
  TOKEN_OPTIONS,
};

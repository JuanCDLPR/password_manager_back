const jwt = require("jsonwebtoken");

const generarJWT = (id, user, pass) => {
  const payload = { id, user, pass };

  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      process.env.SEED_TOKEN,
      {
        //expiresIn: "10 days",
        //expiresIn: "24h",
        expiresIn: "6h",
        //expiresIn: "1m",
        //expiresIn: "600s",
      },
      (err, token) => {
        if (err) {
          // TODO MAL
          console.log(err);
          reject(err);
        } else {
          // TODO BIEN
          resolve(token);
        }
      }
    );
  });
};

module.exports = {
  generarJWT,
};

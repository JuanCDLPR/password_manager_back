const CryptoJS = require("crypto-js");

const Encrypt = (data = "") => {
  const Cifrado = CryptoJS.AES.encrypt(data, process.env.SECRET_KEY).toString();

  return Cifrado;
};

const Decrypt = (data = "") => {
  const bytes = CryptoJS.AES.decrypt(data, process.env.SECRET_KEY);
  const Descifrado = bytes.toString(CryptoJS.enc.Utf8);

  return Descifrado;
};

module.exports = {
  Encrypt,
  Decrypt,
};

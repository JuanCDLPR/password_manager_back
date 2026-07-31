const USER_PATTERN = /^[a-zA-Z0-9._-]+$/;

const cleanString = (value) =>
  typeof value === "string" ? value.trim() : "";

const normalizeUser = (value) => cleanString(value).toLowerCase();

const isValidName = (value) => {
  const name = cleanString(value);
  return name.length >= 2 && name.length <= 100;
};

const isValidUser = (value) => {
  const user = normalizeUser(value);
  return user.length >= 3 && user.length <= 50 && USER_PATTERN.test(user);
};

const isValidPassword = (value) =>
  typeof value === "string" && value.length >= 12 && value.length <= 128;

const isValidOptionalHttpUrl = (value) => {
  const url = cleanString(value);
  if (!url) return true;
  if (url.length > 2048) return false;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

module.exports = {
  cleanString,
  isValidName,
  isValidOptionalHttpUrl,
  isValidPassword,
  isValidUser,
  normalizeUser,
};

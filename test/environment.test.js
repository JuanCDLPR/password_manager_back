const assert = require("node:assert/strict");
const test = require("node:test");
const {
  getAppPublicUrl,
  getAppPublicUrlKey,
  validateDatabaseEnvironment,
} = require("../src/config/env");

const withEnvironment = (values, callback) => {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME,
    PRODUCTION_DB_NAME: process.env.PRODUCTION_DB_NAME,
  };

  Object.assign(process.env, values);
  try {
    callback();
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
};

test("desarrollo no puede apuntar a la base de producción", () => {
  withEnvironment(
    {
      NODE_ENV: "development",
      MONGODB_DB_NAME: "PasswordManager",
      PRODUCTION_DB_NAME: "PasswordManager",
    },
    () =>
      assert.throws(
        validateDatabaseEnvironment,
        /no puede usar la base de producción/
      )
  );
});

test("producción exige exactamente su base declarada", () => {
  withEnvironment(
    {
      NODE_ENV: "production",
      MONGODB_DB_NAME: "PasswordManager",
      PRODUCTION_DB_NAME: "PasswordManager",
    },
    () => assert.doesNotThrow(validateDatabaseEnvironment)
  );
});

test("el ambiente test exige una base identificable como pruebas", () => {
  withEnvironment(
    {
      NODE_ENV: "test",
      MONGODB_DB_NAME: "PasswordManagerDev",
      PRODUCTION_DB_NAME: "PasswordManager",
    },
    () =>
      assert.throws(
        validateDatabaseEnvironment,
        /debe incluir 'test'/
      )
  );
});

test("selecciona la URL pública según NODE_ENV", () => {
  const original = {
    NODE_ENV: process.env.NODE_ENV,
    APP_PUBLIC_URL_LOCAL: process.env.APP_PUBLIC_URL_LOCAL,
    APP_PUBLIC_URL_PRODUCTION: process.env.APP_PUBLIC_URL_PRODUCTION,
  };

  try {
    process.env.APP_PUBLIC_URL_LOCAL = "http://localhost:3021";
    process.env.APP_PUBLIC_URL_PRODUCTION = "https://password.example";

    process.env.NODE_ENV = "development";
    assert.equal(getAppPublicUrlKey(), "APP_PUBLIC_URL_LOCAL");
    assert.equal(getAppPublicUrl(), "http://localhost:3021");

    process.env.NODE_ENV = "test";
    assert.equal(getAppPublicUrl(), "http://localhost:3021");

    process.env.NODE_ENV = "production";
    assert.equal(getAppPublicUrlKey(), "APP_PUBLIC_URL_PRODUCTION");
    assert.equal(getAppPublicUrl(), "https://password.example");
  } finally {
    for (const [key, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});

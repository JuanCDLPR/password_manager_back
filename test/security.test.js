const assert = require("node:assert/strict");
const test = require("node:test");
const jwt = require("jsonwebtoken");
const { generarJWT, TOKEN_OPTIONS } = require("../helpers/jwt");
const {
  isValidEmail,
  isValidOptionalHttpUrl,
  isValidPassword,
  isValidUser,
  normalizeEmail,
  normalizeUser,
} = require("../helpers/validation");
const { requireRole } = require("../middlewares/require-role");
const UsuariosModel = require("../models/usuarios.model");

test("normaliza y valida nombres de usuario", () => {
  assert.equal(normalizeUser("  Usuario.Demo  "), "usuario.demo");
  assert.equal(isValidUser("usuario_demo-1"), true);
  assert.equal(isValidUser("usuario con espacios"), false);
});

test("normaliza y valida correos", () => {
  assert.equal(normalizeEmail("  Persona@Example.COM "), "persona@example.com");
  assert.equal(isValidEmail("persona@example.com"), true);
  assert.equal(isValidEmail("correo-invalido"), false);
});

test("exige contraseñas de 12 a 128 caracteres", () => {
  assert.equal(isValidPassword("corta"), false);
  assert.equal(isValidPassword("ClaveSegura!1"), true);
  assert.equal(isValidPassword("x".repeat(129)), false);
});

test("solo acepta URLs HTTP o HTTPS", () => {
  assert.equal(isValidOptionalHttpUrl(""), true);
  assert.equal(isValidOptionalHttpUrl("https://example.com"), true);
  assert.equal(isValidOptionalHttpUrl("javascript:alert(1)"), false);
});

test("el JWT contiene únicamente identificador y versión de sesión", async () => {
  const originalSeed = process.env.SEED_TOKEN;
  process.env.SEED_TOKEN = "test_seed_with_more_than_32_characters";

  try {
    const token = await generarJWT("507f1f77bcf86cd799439011", 3);
    const decoded = jwt.verify(token, process.env.SEED_TOKEN, TOKEN_OPTIONS);

    assert.equal(decoded.sub, "507f1f77bcf86cd799439011");
    assert.equal(decoded.ver, 3);
    assert.equal(decoded.password, undefined);
    assert.equal(decoded.pass, undefined);
    assert.equal(decoded.user, undefined);
  } finally {
    process.env.SEED_TOKEN = originalSeed;
  }
});

test("el modelo de usuario no serializa campos sensibles", () => {
  const usuario = new UsuariosModel({
    name: "Usuario Demo",
    user: "usuario.demo",
    password: "hash",
    tokenVersion: 4,
  });
  const json = usuario.toJSON();

  assert.equal(json.password, undefined);
  assert.equal(json.tokenVersion, undefined);
  assert.equal(json.role, "user");
  assert.equal(json.status, "active");
});

test("requireRole permite únicamente roles autorizados", () => {
  let permitted = false;
  requireRole("superadmin")(
    { auth: { role: "superadmin" } },
    {},
    (error) => {
      assert.equal(error, undefined);
      permitted = true;
    }
  );
  assert.equal(permitted, true);

  requireRole("superadmin")(
    { auth: { role: "user" } },
    {},
    (error) => {
      assert.equal(error.code, "ROLE_REQUIRED");
      assert.equal(error.status, 403);
    }
  );
});

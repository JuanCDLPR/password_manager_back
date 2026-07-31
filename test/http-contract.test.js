const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");

process.env.BD_CNN ||= "mongodb://127.0.0.1:27017/password_manager_test";
process.env.APP_PUBLIC_URL ||= "http://localhost:3021";
process.env.MONGODB_DB_NAME ||= "PasswordManagerTest";
process.env.PRODUCTION_DB_NAME ||= "PasswordManager";
process.env.SEED_TOKEN ||= "test_seed_with_more_than_32_characters";
process.env.NODE_ENV = "test";
process.env.HTTP_LOGS = "false";

const { app } = require("../index");

let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once("listening", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test("usa un contrato uniforme para respuestas exitosas", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.success, true);
  assert.equal(payload.message, "Servicio disponible");
  assert.deepEqual(payload.data, { status: "ok" });
  assert.equal(payload.codigo, undefined);
});

test("devuelve errores tipados y un identificador de solicitud", async () => {
  const response = await fetch(`${baseUrl}/ruta-inexistente`);
  const payload = await response.json();

  assert.equal(response.status, 404);
  assert.equal(payload.success, false);
  assert.equal(payload.error.code, "NOT_FOUND");
  assert.equal(payload.error.requestId, response.headers.get("x-request-id"));
});

test("responde 401 cuando falta autenticación", async () => {
  const response = await fetch(`${baseUrl}/plataformas`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("la ruta administrativa exige autenticación", async () => {
  const response = await fetch(`${baseUrl}/admin`);
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.equal(payload.error.code, "AUTH_REQUIRED");
});

test("rechaza invitaciones con formato inválido sin consultar la base", async () => {
  const response = await fetch(`${baseUrl}/invitations/token-invalido`);
  const payload = await response.json();

  assert.equal(response.status, 410);
  assert.equal(payload.error.code, "INVITATION_INVALID");
});

test("responde 400 cuando el JSON es inválido", async () => {
  const response = await fetch(`${baseUrl}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  const payload = await response.json();

  assert.equal(response.status, 400);
  assert.equal(payload.error.code, "INVALID_JSON");
});

test("rechaza orígenes CORS no autorizados con 403", async () => {
  const response = await fetch(`${baseUrl}/health`, {
    headers: { Origin: "https://malicioso.example" },
  });
  const payload = await response.json();

  assert.equal(response.status, 403);
  assert.equal(payload.error.code, "FORBIDDEN");
});

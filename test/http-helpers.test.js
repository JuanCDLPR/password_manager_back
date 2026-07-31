const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const test = require("node:test");
const { RESP } = require("../helpers/http");
const {
  formatAuthentication,
  httpLogger,
  sanitizePath,
  sanitizeQuery,
} = require("../middlewares/http-logger");

test("RESP obtiene estado, código y mensaje desde el catálogo", () => {
  const error = RESP.Validation("Nombre inválido", { fields: ["name"] });

  assert.equal(error.status, 422);
  assert.equal(error.code, "VALIDATION_ERROR");
  assert.equal(error.message, "Nombre inválido");
  assert.deepEqual(error.details, { fields: ["name"] });
});

test("el logger redacta tokens de invitación incluidos en la ruta", () => {
  assert.equal(
    sanitizePath("/invitations/token-super-secreto"),
    "/invitations/[REDACTED]"
  );
  assert.equal(sanitizePath("/plataformas/123"), "/plataformas/123");
});

test("RESP usa el mensaje predeterminado del catálogo", () => {
  const error = RESP.NotFound();

  assert.equal(error.status, 404);
  assert.equal(error.code, "NOT_FOUND");
  assert.equal(error.message, "No se encontró el recurso");
});

test("RESP rechaza tipos que no existen en el catálogo", () => {
  assert.throws(
    () => RESP.Error("ERROR_INVENTADO"),
    /no existe en el catálogo HTTP/
  );
});

test("el logger redacta parámetros sensibles", () => {
  assert.deepEqual(
    sanitizeQuery({
      search: "github",
      password: "no-debe-aparecer",
      accessToken: "tampoco",
      filters: { secretKey: "oculto", type: "personal" },
    }),
    {
      search: "github",
      password: "[REDACTED]",
      accessToken: "[REDACTED]",
      filters: { secretKey: "[REDACTED]", type: "personal" },
    }
  );
});

test("el logger distingue rutas públicas y estados de autenticación", () => {
  assert.equal(
    formatAuthentication({}),
    "Ruta pública (autenticación no requerida)"
  );
  assert.equal(
    formatAuthentication({ authContext: { status: "missing" } }),
    "No autenticado (token Bearer ausente)"
  );
  assert.equal(
    formatAuthentication({ authContext: { status: "invalid" } }),
    "No autenticado (token inválido o expirado)"
  );
  assert.equal(
    formatAuthentication({
      authContext: { status: "authenticated", userId: "user-1" },
    }),
    "Autenticado (user-1)"
  );
});

test("el logger imprime una solicitud ordenada y comprensible", () => {
  const previousLogs = process.env.HTTP_LOGS;
  const originalLog = console.log;
  const output = [];
  const response = new EventEmitter();
  response.statusCode = 404;
  response.locals = { errorCode: "NOT_FOUND" };
  const request = {
    requestId: "request-test-1",
    method: "GET",
    path: "/plataformas/123",
    query: { search: "github", token: "secreto" },
    uid: "user-1",
    authContext: { status: "authenticated", userId: "user-1" },
    ip: "127.0.0.1",
    get: () => "Test Agent",
  };

  process.env.HTTP_LOGS = "true";
  console.log = (message) => output.push(message);

  try {
    httpLogger(request, response, () => {});
    response.emit("finish");
  } finally {
    console.log = originalLog;
    if (previousLogs === undefined) {
      delete process.env.HTTP_LOGS;
    } else {
      process.env.HTTP_LOGS = previousLogs;
    }
  }

  const log = output.join("\n");
  assert.match(log, /HTTP REQUEST/);
  assert.match(log, /request-test-1/);
  assert.match(log, /404 Not Found/);
  assert.match(log, /NOT_FOUND/);
  assert.match(log, /\[REDACTED\]/);
  assert.doesNotMatch(log, /secreto/);
});

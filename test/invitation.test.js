const assert = require("node:assert/strict");
const test = require("node:test");
const InvitacionesModel = require("../models/invitaciones.model");
const {
  buildInvitationUrl,
  createInvitationToken,
  getInvitationExpiration,
  hashInvitationToken,
  isValidInvitationToken,
} = require("../services/invitation.service");

test("genera tokens aleatorios de 256 bits en base64url", () => {
  const first = createInvitationToken();
  const second = createInvitationToken();

  assert.equal(isValidInvitationToken(first), true);
  assert.equal(first.length, 43);
  assert.notEqual(first, second);
});

test("almacena una huella SHA-256 y no el token original", () => {
  const token = createInvitationToken();
  const hash = hashInvitationToken(token);

  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.notEqual(hash, token);
  assert.equal(hashInvitationToken(token), hash);
  assert.equal(hashInvitationToken("token inválido"), "");
});

test("construye el enlace de registro desde APP_PUBLIC_URL", () => {
  const original = process.env.APP_PUBLIC_URL;
  process.env.APP_PUBLIC_URL = "https://password.example/app?old=true";

  try {
    const token = createInvitationToken();
    const url = new URL(buildInvitationUrl(token));
    assert.equal(url.origin, "https://password.example");
    assert.equal(url.pathname, "/registrar");
    assert.equal(url.searchParams.get("invitation"), token);
  } finally {
    if (original === undefined) delete process.env.APP_PUBLIC_URL;
    else process.env.APP_PUBLIC_URL = original;
  }
});

test("calcula la expiración con el límite configurado", () => {
  const original = process.env.INVITATION_EXPIRES_HOURS;
  process.env.INVITATION_EXPIRES_HOURS = "24";

  try {
    const now = new Date("2026-07-30T12:00:00.000Z");
    assert.equal(
      getInvitationExpiration(now).toISOString(),
      "2026-07-31T12:00:00.000Z"
    );
  } finally {
    if (original === undefined) delete process.env.INVITATION_EXPIRES_HOURS;
    else process.env.INVITATION_EXPIRES_HOURS = original;
  }
});

test("el modelo nunca serializa tokenHash ni activeEmail", () => {
  const invitation = new InvitacionesModel({
    email: "persona@example.com",
    invitedName: "Persona",
    tokenHash: "a".repeat(64),
    activeEmail: "persona@example.com",
    expiresAt: new Date(),
    createdBy: "507f1f77bcf86cd799439011",
  });
  const json = invitation.toJSON();

  assert.equal(json.tokenHash, undefined);
  assert.equal(json.activeEmail, undefined);
});

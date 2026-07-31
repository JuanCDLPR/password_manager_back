const assert = require("node:assert/strict");
const test = require("node:test");
const {
  EmailTemplateError,
  renderEmailTemplate,
} = require("../services/email-template.service");

const validData = {
  appName: "Password Manager",
  recipientName: "Juan <script>alert(1)</script>",
  message: "Configuración correcta",
  environment: "test",
  sentAt: "30 de julio de 2026",
  appUrl: "https://example.com",
};

test("renderiza asunto, texto y HTML escapando variables", async () => {
  const result = await renderEmailTemplate("configuration-test", validData);

  assert.match(result.subject, /Password Manager/);
  assert.match(result.text, /Configuración correcta/);
  assert.match(result.html, /Juan &lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.doesNotMatch(result.html, /<script>alert\(1\)<\/script>/);
});

test("rechaza nombres de template fuera del catálogo", async () => {
  await assert.rejects(
    renderEmailTemplate("../../.env", validData),
    (error) =>
      error instanceof EmailTemplateError &&
      error.code === "EMAIL_TEMPLATE_NOT_FOUND"
  );
});

test("convierte propiedades faltantes en un error tipado", async () => {
  await assert.rejects(
    renderEmailTemplate("configuration-test", { appName: "Password Manager" }),
    (error) =>
      error instanceof EmailTemplateError &&
      error.code === "EMAIL_TEMPLATE_RENDER_ERROR"
  );
});

test("exige un objeto plano como variables", async () => {
  await assert.rejects(
    renderEmailTemplate("configuration-test", ["dato"]),
    (error) =>
      error instanceof EmailTemplateError &&
      error.code === "EMAIL_TEMPLATE_DATA_INVALID"
  );
});

test("renderiza el template de invitación sin exponer HTML recibido", async () => {
  const result = await renderEmailTemplate("invitation", {
    appName: "Password Manager",
    invitedName: "Persona <b>invitada</b>",
    inviterName: "Administrador",
    invitationUrl: "https://example.com/registrar?invitation=abc",
    expiresAt: "31 de julio de 2026",
  });

  assert.match(result.subject, /invitación/i);
  assert.match(result.html, /Persona &lt;b&gt;invitada&lt;\/b&gt;/);
  assert.doesNotMatch(result.html, /Persona <b>invitada<\/b>/);
});

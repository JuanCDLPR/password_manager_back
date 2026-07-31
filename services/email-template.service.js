const { readFile } = require("node:fs/promises");
const path = require("node:path");
const Handlebars = require("handlebars");

const TEMPLATE_CATALOG = Object.freeze({
  "configuration-test": Object.freeze({
    subject: "Prueba de correo · {{appName}}",
    htmlFile: "configuration-test.html",
    text:
      "Hola {{recipientName}}.\n\n" +
      "{{message}}\n\n" +
      "Ambiente: {{environment}}\n" +
      "Enviado: {{sentAt}}\n" +
      "{{appUrl}}",
  }),
});

class EmailTemplateError extends Error {
  constructor(code, message, cause) {
    super(message, { cause });
    this.name = "EmailTemplateError";
    this.code = code;
  }
}

const compiledTemplates = new Map();

const assertTemplateData = (data) => {
  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data) ||
    ![Object.prototype, null].includes(Object.getPrototypeOf(data))
  ) {
    throw new EmailTemplateError(
      "EMAIL_TEMPLATE_DATA_INVALID",
      "Las variables del template deben ser un objeto plano"
    );
  }
};

const loadTemplate = async (templateName) => {
  const definition = TEMPLATE_CATALOG[templateName];
  if (!definition) {
    throw new EmailTemplateError(
      "EMAIL_TEMPLATE_NOT_FOUND",
      `No existe el template de correo "${templateName}"`
    );
  }

  if (!compiledTemplates.has(templateName)) {
    const templatePath = path.join(
      __dirname,
      "..",
      "templates",
      "email",
      definition.htmlFile
    );
    const source = await readFile(templatePath, "utf8");

    compiledTemplates.set(
      templateName,
      Object.freeze({
        html: Handlebars.compile(source, { strict: true }),
        subject: Handlebars.compile(definition.subject, { strict: true }),
        text: Handlebars.compile(definition.text, { strict: true }),
      })
    );
  }

  return compiledTemplates.get(templateName);
};

const renderEmailTemplate = async (templateName, data) => {
  assertTemplateData(data);

  try {
    const template = await loadTemplate(templateName);
    return {
      subject: template.subject(data),
      html: template.html(data),
      text: template.text(data),
    };
  } catch (error) {
    if (error instanceof EmailTemplateError) throw error;

    throw new EmailTemplateError(
      "EMAIL_TEMPLATE_RENDER_ERROR",
      `No fue posible renderizar el template "${templateName}"`,
      error
    );
  }
};

module.exports = {
  EmailTemplateError,
  renderEmailTemplate,
};

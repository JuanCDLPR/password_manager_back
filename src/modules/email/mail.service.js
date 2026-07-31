const formData = require("form-data");
const Mailgun = require("mailgun.js");
const { getAppPublicUrl } = require("../../config/env");
const { renderEmailTemplate } = require("./email-template.service");

// Este módulo es el único punto de integración con el proveedor de correo.

let client;

const isMailEnabled = () => process.env.MAIL_ENABLED === "true";

const getClient = () => {
  if (!isMailEnabled()) {
    throw new Error("El envío de correo está desactivado");
  }

  if (!client) {
    const mailgun = new Mailgun(formData);
    client = mailgun.client({
      username: "api",
      key: process.env.MAILGUN_API_KEY,
      ...(process.env.MAILGUN_BASE_URL && {
        url: process.env.MAILGUN_BASE_URL,
      }),
    });
  }

  return client;
};

const sendMail = async ({ to, subject, text, html }) =>
  getClient().messages.create(process.env.MAILGUN_DOMAIN, {
    from: process.env.MAIL_FROM,
    to: [to],
    subject,
    text,
    ...(html && { html }),
  });

const sendTemplateMail = async ({ to, templateName, data }) => {
  const content = await renderEmailTemplate(templateName, data);
  return sendMail({
    to,
    ...content,
  });
};

const sendConfigurationTest = (to, recipientName = "Juan Carlos") =>
  sendTemplateMail({
    to,
    templateName: "configuration-test",
    data: {
      appName: "Password Manager",
      recipientName,
      message:
        "Mailgun y el sistema reutilizable de templates quedaron configurados correctamente.",
      environment: process.env.NODE_ENV || "development",
      sentAt: new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Chihuahua",
      }).format(new Date()),
      appUrl: getAppPublicUrl(),
    },
  });

const sendInvitationEmail = ({
  to,
  invitedName,
  inviterName,
  invitationUrl,
  expiresAt,
}) =>
  sendTemplateMail({
    to,
    templateName: "invitation",
    data: {
      appName: "Password Manager",
      invitedName,
      inviterName,
      invitationUrl,
      expiresAt: new Intl.DateTimeFormat("es-MX", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Chihuahua",
      }).format(expiresAt),
    },
  });

module.exports = {
  isMailEnabled,
  sendConfigurationTest,
  sendInvitationEmail,
  sendMail,
  sendTemplateMail,
};

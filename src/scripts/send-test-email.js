const { config } = require("dotenv");

config();

const { validateMailEnvironment } = require("../config/env");
const {
  sendConfigurationTest,
} = require("../modules/email/mail.service");

const run = async () => {
  const recipient = process.argv[2]?.trim();
  const recipientName = process.argv[3]?.trim() || "Usuario";
  if (!recipient) {
    throw new Error(
      "Indica un destinatario: npm run mail:test -- correo@ejemplo.com"
    );
  }

  validateMailEnvironment();
  await sendConfigurationTest(recipient, recipientName);
  console.log(`Correo de prueba aceptado por Mailgun para ${recipient}`);
};

run().catch((error) => {
  console.error(`No fue posible enviar el correo de prueba: ${error.message}`);
  process.exitCode = 1;
});

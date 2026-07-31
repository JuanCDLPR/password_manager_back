# 08. Correo con Mailgun

Actualizado el 30 de julio de 2026.

Mailgun está integrado como servicio opcional y permanece apagado hasta tener
credenciales válidas. El registro no envía correo todavía; la integración
prepara el siguiente paso de invitaciones y verificación.

Los mensajes utilizan templates HTML catalogados, con texto plano alternativo,
variables escapadas y errores tipados. Consulta
[Templates HTML de correo](09-PLANTILLAS-CORREO.md).

## Variables

```dotenv
MAIL_ENABLED=false
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_BASE_URL=https://api.mailgun.net
MAIL_FROM=Password Manager <postmaster@sandboxXXXXXXXX.mailgun.org>
APP_PUBLIC_URL_LOCAL=http://localhost:3021
APP_PUBLIC_URL_PRODUCTION=https://tu-frontend.vercel.app
```

- `MAILGUN_API_KEY`: API key privada; solo backend.
- `MAILGUN_DOMAIN`: dominio sandbox o dominio propio verificado.
- `MAILGUN_BASE_URL`: usa `https://api.eu.mailgun.net` si la cuenta está en EU.
- `MAIL_FROM`: remitente permitido por el dominio.
- `APP_PUBLIC_URL_LOCAL`: base usada con `development` y `test`.
- `APP_PUBLIC_URL_PRODUCTION`: base usada automáticamente con `production`.

Los templates y enlaces consultan la URL mediante la configuración central; no
deben leer estas variables directamente.

Para esta aplicación se debe crear una **Domain Sending Key** limitada al
dominio, no reutilizar la clave primaria de la cuenta. Si una clave se pega en
un chat, ticket, captura o commit, debe revocarse y reemplazarse. La nueva clave
se escribe directamente en el `.env` local o en los secretos del hosting.

## Probar sin dominio propio

Cada cuenta nueva recibe un dominio sandbox. Sirve únicamente para pruebas y
solo envía a destinatarios autorizados que aceptaron la invitación; admite hasta
cinco. Agrega y verifica primero tu correo desde Mailgun.

Después configura el sandbox, cambia `MAIL_ENABLED=true` y ejecuta:

```bash
npm run mail:test -- tu-correo@ejemplo.com
```

No se imprimen API keys. Si la prueba falla, vuelve a `MAIL_ENABLED=false`.

Para enviar a usuarios arbitrarios en producción necesitarás verificar un
dominio propio. A la fecha de esta documentación, Mailgun anuncia un plan Free
de 100 correos diarios, pero sus límites pueden cambiar.

## Estado del dominio del proyecto

El dominio de envío configurado localmente es
`passman.gaylordemexico.com`, con remitente
`no-reply@passman.gaylordemexico.com`.

La consulta pública del 30 de julio de 2026 encontró:

- SPF con `include:mailgun.org`;
- MX hacia `mxa.mailgun.org` y `mxb.mailgun.org`;
- CNAME de tracking hacia `mailgun.org`.

El selector DKIM no puede deducirse de forma confiable sin la configuración del
panel. Antes de activar el correo, Mailgun debe mostrar el dominio como
verificado y su DKIM requerido como válido.

## Referencias oficiales

- [Dominio sandbox](https://documentation.mailgun.com/docs/mailgun/user-manual/domains/domains-sandbox)
- [Quickstart](https://documentation.mailgun.com/docs/mailgun/quickstart)
- [SDK para Node.js](https://documentation.mailgun.com/docs/mailgun/sdk/nodejs_sdk)
- [Administración segura de API keys](https://documentation.mailgun.com/docs/mailgun/user-manual/api-key-mgmt/rbac-mgmt)
- [Plan gratuito](https://help.mailgun.com/hc/en-us/articles/203068914-What-does-the-Free-plan-offer)

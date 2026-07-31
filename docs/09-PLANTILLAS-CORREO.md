# 09. Templates HTML de correo

Actualizado el 30 de julio de 2026.

Los correos se renderizan por nombre mediante:

```js
const { renderEmailTemplate } = require("../services/email-template.service");

const content = await renderEmailTemplate("configuration-test", {
  appName: "Password Manager",
  recipientName: "Juan",
  message: "Configuración correcta",
  environment: "production",
  sentAt: "30 de julio de 2026",
  appUrl: "https://example.com",
});
```

`content` contiene `subject`, `text` y `html`. Para renderizar y enviar en una
sola operación:

```js
await sendTemplateMail({
  to: "persona@example.com",
  templateName: "configuration-test",
  data: { /* propiedades del template */ },
});
```

## Convenciones

- Los archivos HTML viven en `templates/email/`.
- Cada template debe declararse en `TEMPLATE_CATALOG`; no se aceptan rutas
  recibidas desde una petición.
- Handlebars escapa las propiedades insertadas en HTML.
- Todos los correos deben incluir una alternativa de texto plano.
- No se permite HTML sin escapar proveniente de usuarios.
- Los templates se compilan una vez y se conservan en memoria.

## Errores

`EmailTemplateError` expone códigos reutilizables:

| Código | Significado |
| --- | --- |
| `EMAIL_TEMPLATE_NOT_FOUND` | El nombre no está declarado en el catálogo |
| `EMAIL_TEMPLATE_DATA_INVALID` | Las variables no son un objeto plano |
| `EMAIL_TEMPLATE_RENDER_ERROR` | Falta una propiedad o falló el render |

Al agregar verificación, invitaciones o recuperación de cuenta, se debe crear
un archivo y una entrada de catálogo independientes para cada caso.

Templates actuales:

| Nombre | Uso |
| --- | --- |
| `configuration-test` | Comprobar la integración con Mailgun |
| `invitation` | Enviar el enlace privado de registro |

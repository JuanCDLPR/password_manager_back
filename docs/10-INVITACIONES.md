# 10. Invitaciones y registro privado

Actualizado el 30 de julio de 2026.

El registro público está cerrado. Solo un `superadmin` autenticado puede crear
una invitación y cada enlace:

- está ligado a un correo normalizado;
- contiene 32 bytes aleatorios codificados como base64url;
- se guarda en MongoDB únicamente como SHA-256;
- vence después de `INVITATION_EXPIRES_HOURS` (24 horas por defecto);
- solo puede consumirse una vez;
- puede revocarse o reenviarse;
- nunca se devuelve desde la API administrativa ni se imprime en logs.

La URL del enlace se elige automáticamente: local para `development`/`test` y
pública para `production`.

## Flujo

```text
Superadmin crea invitación
        ↓
Backend guarda hash y Mailgun envía el enlace
        ↓
Frontend consulta GET /invitations/:token
        ↓
Usuario registra nombre, usuario y contraseña
        ↓
Transacción crea la cuenta y marca la invitación como used
```

El correo del formulario se obtiene de la invitación y el backend vuelve a
compararlo. Al consumir correctamente el enlace, `emailVerifiedAt` se establece
en la fecha del registro.

## Estados

| Estado | Descripción |
| --- | --- |
| `pending` | Puede utilizarse y aún no vence |
| `used` | Creó una cuenta correctamente |
| `revoked` | Fue cancelada por un administrador |
| `expired` | Superó la fecha límite |

`deliveryStatus` registra `pending`, `sent` o `failed` sin almacenar respuestas
sensibles del proveedor.

## Operación administrativa

El panel React está disponible en `/admin/invitations` únicamente cuando la
sesión corresponde a un `superadmin`. Ocultar el menú es solo presentación:
todos los endpoints vuelven a exigir JWT, cuenta activa y rol en el backend.

Reenviar rota el token y extiende la expiración; el enlace anterior deja de ser
válido. Revocar conserva el documento como auditoría.

## Consistencia

La creación de la cuenta y el consumo de la invitación se ejecutan dentro de una
transacción de MongoDB. Producción debe utilizar un replica set o MongoDB Atlas;
no se debe degradar este flujo a dos escrituras independientes.

Las pruebas automatizadas validan generación, formato, hash, expiración,
construcción de URL, serialización segura y escape del template. No se conectan
a la base persistente.

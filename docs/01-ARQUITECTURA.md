# 01. Arquitectura

## Vista general

```mermaid
flowchart LR
    U[Usuario] --> F[React SPA]
    F -->|JSON + Bearer token| A[Express API]
    A --> H[Helmet / CORS / límites]
    H --> J[Middleware JWT]
    J --> C[Controladores]
    C --> DB[(MongoDB)]
```

| Capa | Repositorio | Responsabilidad |
| --- | --- | --- |
| Frontend | `password_manager` | SPA React, formularios y consumo de la API |
| Backend | `password_manager_back` | Autenticación, autorización y persistencia |

## Backend

- `src/app.js`: configura Express y monta las rutas de cada módulo.
- `src/server.js`: conecta MongoDB, escucha el puerto y cierra ordenadamente.
- `src/config/env.js`: valida conexión, ambiente, correo, JWT y puerto.
- `src/database/mongo.js`: abre exclusivamente la conexión configurada.
- `src/modules/auth/`: verifica JWT, versión de sesión, estado y roles.
- `src/modules/users/`: registro invitado, login y consulta de sesión.
- `src/modules/profile/`: perfil y cambio de contraseña.
- `src/modules/platforms/`: modelo y CRUD aislado por propietario.
- `src/modules/invitations/`: tokens, modelo, administración y consumo.
- `src/modules/email/`: Mailgun, catálogo de templates y HTML.
- `src/modules/admin/`: composición de endpoints para `superadmin`.
- `src/shared/http/`: catálogo HTTP, `RESP` y manejo asíncrono.
- `src/shared/middleware/`: logging, errores, rate limits y request ID.
- `src/shared/validation/`: funciones puras utilizadas por varios módulos.

Las dependencias compartidas no importan módulos de negocio. `app.js` compone la
aplicación y `server.js` espera MongoDB antes de escuchar. Consulta
[Organización del código](12-ESTRUCTURA-SRC.md).

## Modelos

### Usuario

| Campo | Detalle |
| --- | --- |
| `name` | 2 a 100 caracteres |
| `user` | Normalizado a minúsculas, índice único |
| `email` | Normalizado, único cuando existe |
| `password` | Hash bcrypt, costo 12, `select: false` |
| `tokenVersion` | Invalida JWT anteriores, `select: false` |
| `role`, `status` | Autorización y habilitación de la cuenta |
| `emailVerifiedAt`, `lastLoginAt` | Auditoría de correo y acceso |
| `img` | URL opcional, máximo 2048 caracteres |
| `fecha`, `actualizado` | Fechas de auditoría básica |

### Plataforma

| Campo | Detalle |
| --- | --- |
| `id_usuario` | ObjectId obligatorio e indexado |
| `name` | 1 a 100 caracteres |
| `url` | HTTP/HTTPS opcional |
| `fecha`, `actualizado` | Fechas |

Cada consulta, actualización y eliminación usa simultáneamente `_id` e
`id_usuario`; conocer el identificador de otro usuario no concede acceso.

### Invitación

Guarda correo, nombre, estado, expiración, creador y auditoría de consumo o
revocación. `tokenHash` y `activeEmail` están ocultos; el token original solo
existe durante el envío. Un índice único sobre `activeEmail` impide dos
invitaciones pendientes para el mismo correo.

## Sesión

1. Registro guarda un hash bcrypt; nunca guarda una contraseña recuperable.
2. Login compara con `bcrypt.compare`.
3. El JWT incluye `sub` y `ver`, con emisor y audiencia fijos.
4. El middleware vuelve a consultar la versión de sesión del usuario.
5. Cambiar contraseña incrementa `tokenVersion` e invalida todos los JWT
   anteriores.
6. Renovar sesión usa `POST` con contraseña en JSON, nunca en la URL.

## Frontend

`REACT_APP_API_URL` define la API. El cliente HTTP ofrece métodos `get`, `post`,
`patch` y `delete`; devuelve respuestas exitosas y lanza `ApiError` para HTTP,
contrato inválido o red. Así todos los módulos consumen `status`, `code`,
`message`, `details` y `requestId` de la misma forma.

Las rutas siguen una convención REST: recursos en plural, identificadores en el
path y filtros en query string. Al salir se eliminan únicamente `JWT`, `nombre`
y `user`.

El JWT aún se guarda en `localStorage`; migrarlo a una cookie `HttpOnly` requiere
rediseñar conjuntamente autenticación, CORS y protección CSRF.

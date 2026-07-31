# Password Manager API

API REST del proyecto **Password Manager**, construida con Node.js, Express,
MongoDB y Mongoose. Proporciona autenticación, perfil y un catálogo personal de
plataformas.

> [!IMPORTANT]
> El proyecto todavía no es un gestor de contraseñas completo: no existe un
> modelo de accesos/credenciales y las plataformas solo almacenan nombre y URL.
> La autenticación y los datos actuales fueron endurecidos, pero la futura
> bóveda necesita un diseño criptográfico específico antes de guardar secretos.

## Funcionalidades

- Registro con correo y contraseña hasheada mediante bcrypt, costo 12.
- Inicio de sesión por usuario o correo y renovación de JWT.
- Roles `user`/`superadmin`, estado de cuenta y autorización administrativa.
- Bases separadas y protegidas por ambiente.
- Servicio opcional de correo con Mailgun.
- Registro privado mediante invitaciones de un solo uso.
- Panel de invitaciones exclusivo para `superadmin`.
- Invalidación de sesiones anteriores al cambiar la contraseña.
- Consulta y edición segura del perfil.
- CRUD de plataformas aislado por propietario.
- Búsqueda y ordenamiento.
- Validación de entradas, rate limiting, Helmet, CORS configurable y límite de
  10 KB por solicitud.
- Respuestas sin hash de contraseña ni versión de sesión.
- Contrato HTTP central con errores tipados y `X-Request-Id`.
- Rutas REST y códigos 200/201/204/4xx/5xx convencionales.
- Catálogo `RESP` para no repetir estados ni códigos en controladores.
- Logger HTTP global, legible y con datos sensibles redactados.

## Tecnologías

- Node.js 18+
- Express 4
- MongoDB y Mongoose 8
- bcryptjs
- JSON Web Token
- Helmet, CORS y express-rate-limit
- dotenv

El backend utiliza exclusivamente MongoDB. El código y la dependencia heredados
de MySQL fueron eliminados.

## Instalación

```bash
git clone https://github.com/JuanCDLPR/password_manager_back.git
cd password_manager_back
npm install
```

Copia `.example.env` como `.env`:

```dotenv
NODE_ENV=development
PORT=3024
BD_CNN=mongodb://127.0.0.1:27017/
MONGODB_DB_NAME=PasswordManagerDev
PRODUCTION_DB_NAME=PasswordManager
SEED_TOKEN=un_secreto_aleatorio_de_32_caracteres_o_mas
JWT_EXPIRES_IN=6h
CORS_ORIGINS=http://localhost:3021
TRUST_PROXY=false
HTTP_LOGS=true
MAIL_ENABLED=false
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_BASE_URL=https://api.mailgun.net
MAIL_FROM=Password Manager <postmaster@sandboxXXXXXXXX.mailgun.org>
APP_PUBLIC_URL=http://localhost:3021
INVITATION_EXPIRES_HOURS=24
```

`BD_CNN` es la única fuente de la cadena de conexión y `MONGODB_DB_NAME`
selecciona la base aislada del ambiente. No se incluyen credenciales ni
direcciones privadas en el código.

```bash
npm start
```

La API estará disponible en `http://localhost:3024`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia la API |
| `npm run bootstrap:admin` | Crea el primer superadministrador |
| `npm run mail:test -- correo` | Envía una prueba con Mailgun |
| `npm run dev` | Inicia con recarga automática |
| `npm run check` | Verifica la sintaxis del punto de entrada |
| `npm test` | Ejecuta las pruebas de seguridad |

## Autenticación

Las rutas privadas esperan el JWT con el esquema Bearer estándar:

```http
Authorization: Bearer <token>
```

El JWT contiene únicamente el identificador (`sub`), una versión de sesión
(`ver`) y los claims estándar. Nunca contiene usuario ni contraseña.

## Logging HTTP

Con `HTTP_LOGS=true`, cada solicitud imprime un bloque al terminar:

```text
┌─ HTTP REQUEST ─────────────────────────────────────────
│ ID:       5b9d...
│ Método:   GET
│ Ruta:     /plataformas
│ Query:    {"search":"github"}
│ Estado:   200 OK
│ Duración: 12.34 ms
│ Auth:     Autenticado (66ab...)
│ IP:       ::1
│ Error:    (ninguno)
│ Agente:   Mozilla/5.0 ...
└─────────────────────────────────────────────────────────
```

No se imprime el body ni el encabezado `Authorization`. Parámetros de query
relacionados con contraseñas, tokens, secretos o claves se muestran como
`[REDACTED]`. Puede desactivarse con `HTTP_LOGS=false`.

El campo `Auth` diferencia entre ruta pública, token ausente, token inválido y
usuario autenticado. Login, registro, `/health` y solicitudes preflight son
rutas públicas y no tienen un usuario asociado.

## Estructura

```text
config/       Validación y lectura segura del entorno
connection/   Conexión MongoDB
controllers/  Casos de uso y consultas Mongoose
helpers/      JWT y validación reutilizable
middlewares/  Sesión y límites de frecuencia
models/       Esquemas Mongoose y formato de respuesta
routes/       Endpoints
test/         Pruebas automatizadas de seguridad
docs/         Arquitectura, API, seguridad y hoja de ruta
index.js      Configuración e inicio ordenado del servidor
```

## Documentación

- [Índice](docs/README.md)
- [01. Arquitectura](docs/01-ARQUITECTURA.md)
- [02. Referencia de la API](docs/02-API.md)
- [03. Seguridad](docs/03-SEGURIDAD.md)
- [04. Estado y mejoras pendientes](docs/04-ESTADO-Y-MEJORAS.md)
- [05. Ambientes y bases](docs/05-AMBIENTES.md)
- [06. Roles y permisos](docs/06-ROLES-Y-PERMISOS.md)
- [07. Bootstrap del administrador](docs/07-BOOTSTRAP-ADMIN.md)
- [08. Mailgun](docs/08-MAILGUN.md)
- [09. Templates HTML de correo](docs/09-PLANTILLAS-CORREO.md)
- [10. Invitaciones y registro privado](docs/10-INVITACIONES.md)

## Frontend

[JuanCDLPR/password_manager](https://github.com/JuanCDLPR/password_manager)

## Autores

- [MrLoop15](https://github.com/Mrloop15)
- [JuanCDLPR](https://github.com/JuanCDLPR)

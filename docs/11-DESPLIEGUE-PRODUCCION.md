# 11. Configuración y despliegue de producción

Actualizado el 30 de julio de 2026.

## Qué selecciona cada variable

Hay cuatro destinos independientes:

| Variable | Responsabilidad |
| --- | --- |
| `NODE_ENV` | Activa reglas de `development`, `test` o `production` |
| `BD_CNN` | Selecciona el servidor o clúster MongoDB |
| `MONGODB_DB_NAME` | Selecciona la base concreta dentro del clúster |
| `PRODUCTION_DB_NAME` | Solo identifica y protege el nombre de producción |
| `REACT_APP_API_URL` | Indica al navegador qué backend debe consumir |

`PRODUCTION_DB_NAME` no establece la conexión. Si
`MONGODB_DB_NAME=PasswordManagerDev`, el backend utilizará desarrollo aunque
`PRODUCTION_DB_NAME=PasswordManager` esté presente.

El frontend usa `http://localhost:3024/` como fallback. En Vercel se debe
declarar `REACT_APP_API_URL` antes de compilar o seguirá intentando consumir el
backend local.

## Backend de producción

Configura estas variables como secretos del proveedor de hosting, no dentro del
`.env` local:

```dotenv
NODE_ENV=production
BD_CNN=mongodb+srv://USUARIO:CONTRASENA@CLUSTER/
MONGODB_DB_NAME=PasswordManager
PRODUCTION_DB_NAME=PasswordManager
SEED_TOKEN=SECRETO_JWT_EXCLUSIVO_DE_PRODUCCION
JWT_EXPIRES_IN=6h
PORT=3024
CORS_ORIGINS=https://TU-FRONTEND.vercel.app
TRUST_PROXY=true
HTTP_LOGS=true
APP_PUBLIC_URL=https://TU-FRONTEND.vercel.app
INVITATION_EXPIRES_HOURS=24
MAIL_ENABLED=true
MAILGUN_API_KEY=SECRETO_DEL_HOSTING
MAILGUN_DOMAIN=passman.gaylordemexico.com
MAILGUN_BASE_URL=https://api.mailgun.net
MAIL_FROM=Password Manager <no-reply@passman.gaylordemexico.com>
```

El arranque se detiene si producción no usa exactamente
`PRODUCTION_DB_NAME`. Desarrollo y pruebas también se detienen si intentan usar
ese nombre.

## Frontend de producción

Configura en Vercel:

```dotenv
REACT_APP_API_URL=https://TU-BACKEND/
```

La variable se incorpora durante el build de Create React App. Después de
cambiarla es necesario generar un deployment nuevo.

## Primer superadministrador

El despliegue no debe exponer una ruta para crear administradores. Ejecuta una
sola vez `npm run bootstrap:admin` con las variables de producción declaradas
temporalmente en una terminal confiable. El script:

- exige que la base coincida con `PRODUCTION_DB_NAME`;
- solicita confirmar escribiendo el nombre de la base;
- se detiene si ya existe un `superadmin`;
- nunca promueve, elimina ni modifica cuentas existentes.

Al terminar, cierra la terminal o elimina las variables temporales para no
arrancar accidentalmente el entorno local contra producción.

## Comprobación previa

Antes de enviar invitaciones reales:

1. `/health` debe responder desde el backend público.
2. El frontend debe consumir el backend público, no `localhost`.
3. CORS debe contener exactamente el origen del frontend.
4. `APP_PUBLIC_URL` debe generar enlaces públicos de registro.
5. El log de conexión debe mostrar `PasswordManager (production)`.

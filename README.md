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

- Registro con contraseña hasheada mediante bcrypt, costo 12.
- Inicio de sesión y renovación de JWT.
- Invalidación de sesiones anteriores al cambiar la contraseña.
- Consulta y edición segura del perfil.
- CRUD de plataformas aislado por propietario.
- Búsqueda y ordenamiento.
- Validación de entradas, rate limiting, Helmet, CORS configurable y límite de
  10 KB por solicitud.
- Respuestas sin hash de contraseña ni versión de sesión.

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
BD_CNN=mongodb://127.0.0.1:27017/PasswordManager
SEED_TOKEN=un_secreto_aleatorio_de_32_caracteres_o_mas
JWT_EXPIRES_IN=6h
CORS_ORIGINS=http://localhost:3021
TRUST_PROXY=false
```

`BD_CNN` es la única fuente de la cadena de conexión. No se incluyen
credenciales ni direcciones privadas en el código.

```bash
npm start
```

La API estará disponible en `http://localhost:3024`.

## Scripts

| Comando | Descripción |
| --- | --- |
| `npm start` | Inicia la API |
| `npm run dev` | Inicia con recarga automática |
| `npm run check` | Verifica la sintaxis del punto de entrada |
| `npm test` | Ejecuta las pruebas de seguridad |

## Autenticación

Las rutas privadas esperan el JWT sin prefijo en:

```http
Administracion: <token>
```

El JWT contiene únicamente el identificador (`sub`), una versión de sesión
(`ver`) y los claims estándar. Nunca contiene usuario ni contraseña.

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
- [Arquitectura](docs/ARQUITECTURA.md)
- [Referencia de la API](docs/API.md)
- [Seguridad](docs/SEGURIDAD.md)
- [Estado y mejoras pendientes](docs/ESTADO-Y-MEJORAS.md)

## Frontend

[JuanCDLPR/password_manager](https://github.com/JuanCDLPR/password_manager)

## Autores

- [MrLoop15](https://github.com/Mrloop15)
- [JuanCDLPR](https://github.com/JuanCDLPR)

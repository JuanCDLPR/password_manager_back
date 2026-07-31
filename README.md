# Password Manager API

API REST del proyecto **Password Manager**, construida con Node.js, Express y
MongoDB. Actualmente proporciona autenticación, administración del perfil del
usuario y un catálogo personal de plataformas.

> [!IMPORTANT]
> El estado actual todavía no constituye un gestor de contraseñas completo:
> no existe un modelo de accesos/credenciales y las plataformas solo almacenan
> nombre y URL. Revisa el [estado y plan de mejoras](docs/ESTADO-Y-MEJORAS.md)
> antes de usar el proyecto en producción.

## Funcionalidades actuales

- Registro e inicio de sesión.
- Sesiones JWT con duración de 6 horas y renovación manual.
- Consulta y edición del perfil.
- Cambio de contraseña del usuario.
- CRUD de plataformas, con búsqueda y ordenamiento.
- Separación de los registros por usuario al listar plataformas.
- Respuestas JSON con una estructura común.

## Tecnologías

- Node.js 18
- Express 4
- MongoDB y Mongoose 8
- JSON Web Token
- CryptoJS
- CORS y dotenv

El repositorio conserva una implementación antigua para MySQL, pero las rutas
activas utilizan MongoDB.

## Requisitos

- Node.js 18 o una versión LTS compatible.
- npm.
- Una instancia de MongoDB local o remota.

## Instalación

```bash
git clone https://github.com/JuanCDLPR/password_manager_back.git
cd password_manager_back
npm install
```

Copia `.example.env` como `.env` y reemplaza los valores de ejemplo:

```dotenv
BD_CNN=mongodb://127.0.0.1:27017/password_manager
SECRET_KEY=una_clave_larga_y_aleatoria_para_cifrado
SEED_TOKEN=otra_clave_larga_y_aleatoria_para_jwt
PORT=3024
```

`PORT=3024` hace coincidir la API con la URL que usa actualmente el frontend.
Si no se define, el servidor utiliza el puerto `3000`.

Inicia el servidor:

```bash
node index.js
```

Para recarga automática puede usarse `npx nodemon index.js`. El script
`npm run dev` requiere que `nodemon` esté disponible, pero actualmente no está
declarado entre las dependencias del proyecto.

La API quedará disponible en `http://localhost:3024`.

## Uso de la API

Las rutas privadas esperan el JWT sin el prefijo `Bearer` en el encabezado
personalizado:

```http
Administracion: <token>
```

Ejemplo de autenticación:

```bash
curl -X POST http://localhost:3024/usuarios/auth \
  -H "Content-Type: application/json" \
  -d "{\"user\":\"demo\",\"password\":\"secreto\"}"
```

Todos los endpoints y sus contratos están descritos en la
[referencia de la API](docs/API.md).

## Estructura

```text
connection/   Conexión activa a MongoDB y conexión MySQL heredada
controllers/  Casos de uso y acceso a datos
helpers/      JWT y cifrado simétrico
middlewares/  Validación de sesión
models/       Esquemas Mongoose y formato de respuesta
public/       Archivo estático de prueba
routes/       Definición de endpoints
docs/         Documentación técnica y evaluación del proyecto
index.js      Composición e inicio del servidor
```

## Scripts y pruebas

| Comando | Estado |
| --- | --- |
| `node index.js` | Inicia la API |
| `npm run dev` | Inicia con nodemon si está instalado |
| `npm test` | No implementado; termina con error intencional |

Todavía no hay pruebas automatizadas, linting, formateo ni integración
continua.

## Documentación

- [Índice de documentación](docs/README.md)
- [Arquitectura](docs/ARQUITECTURA.md)
- [Referencia de la API](docs/API.md)
- [Estado actual, riesgos y mejoras](docs/ESTADO-Y-MEJORAS.md)

## Frontend

El cliente React se encuentra en
[JuanCDLPR/password_manager](https://github.com/JuanCDLPR/password_manager).

## Autores

- [MrLoop15](https://github.com/Mrloop15)
- [JuanCDLPR](https://github.com/JuanCDLPR)


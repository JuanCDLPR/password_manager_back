# Referencia HTTP de la API

## Contrato compartido

El estado HTTP es la única fuente del resultado. Ya no se duplica dentro de
campos como `codigo` o `estatus`.

Respuesta exitosa:

```json
{
  "success": true,
  "message": "Plataformas obtenidas",
  "data": [],
  "meta": {
    "count": 0
  }
}
```

`meta` es opcional. Una eliminación correcta devuelve `204 No Content`.

Respuesta fallida:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos no son válidos",
    "details": {
      "fields": ["nombre"]
    },
    "requestId": "b34a0d29-..."
  }
}
```

`code` es estable y puede controlar comportamiento de la aplicación.
`message` puede mostrarse al usuario. `details` es opcional. `requestId`
correlaciona el error con logs y también se entrega en `X-Request-Id`.

## Estados utilizados

| HTTP | Uso |
| --- | --- |
| 200 | Consulta, sesión o actualización correcta |
| 201 | Recurso creado |
| 204 | Eliminación correcta, sin cuerpo |
| 400 | JSON o identificador mal formado |
| 401 | Autenticación ausente, inválida o credenciales incorrectas |
| 403 | Operación prohibida, incluido origen CORS |
| 404 | Ruta o recurso no encontrado |
| 409 | Conflicto, como usuario duplicado |
| 413 | Solicitud superior a 10 KB |
| 422 | Campos con formato o reglas de negocio inválidas |
| 429 | Límite de solicitudes excedido |
| 500 | Error interno no esperado |

## Códigos de error

`AUTH_REQUIRED`, `CONFLICT`, `FORBIDDEN`, `INTERNAL_ERROR`,
`INVALID_CREDENTIALS`, `INVALID_IDENTIFIER`, `INVALID_JSON`, `NOT_FOUND`,
`RATE_LIMITED`, `REQUEST_TOO_LARGE`, `SESSION_INVALID` y `VALIDATION_ERROR`.

## Catálogo y helper RESP

La relación entre tipo, estado HTTP, código y mensaje predeterminado vive
exclusivamente en `config/http-catalog.js`. Los controladores no escriben
números HTTP ni construyen errores manualmente.

```js
throw RESP.Validation("El nombre es obligatorio", {
  fields: ["nombre"],
});

throw RESP.NotFound("No se encontró la plataforma");

return RESP.Ok(res, plataforma, "Plataforma encontrada");
return RESP.Created(res, plataforma, "Plataforma creada");
return RESP.NoContent(res);
```

Para agregar un error nuevo:

1. Añadir una entrada a `HTTP_ERRORS`.
2. Añadir, si se usa frecuentemente, un atajo semántico en `RESP`.
3. Usarlo sin repetir `status` o `code` en controladores.

También existe `RESP.Error(tipo, mensaje?, detalles?)` para tipos menos
frecuentes. Si el tipo no está registrado, falla explícitamente.

## Convenciones

- Base local: `http://localhost:3024`.
- Cuerpo: JSON.
- Sesión privada: `Authorization: Bearer <token>`.
- Recursos en plural.
- Identificadores como segmentos de URL.
- `GET` consulta, `POST` crea/inicia, `PATCH` modifica y `DELETE` elimina.
- Filtros en query string en minúsculas.

## Salud

### `GET /health`

Pública. Devuelve 200 cuando el proceso HTTP está disponible.

## Usuarios y sesión

### `POST /usuarios`

Registra una cuenta. Devuelve 201.

```json
{
  "name": "Usuario Demo",
  "user": "usuario.demo",
  "password": "ClaveSegura!1"
}
```

### `POST /usuarios/session`

Inicia sesión. Devuelve 200 con `name`, `user` y `token`.

### `POST /usuarios/session/refresh`

Privada. Renueva la sesión:

```json
{
  "password": "ClaveSegura!1"
}
```

## Plataformas

Todas requieren sesión.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/plataformas?search=git&order=1` | Lista y filtra |
| POST | `/plataformas` | Crea |
| GET | `/plataformas/:id` | Consulta una |
| PATCH | `/plataformas/:id` | Actualiza |
| DELETE | `/plataformas/:id` | Elimina y devuelve 204 |

Body de creación/actualización:

```json
{
  "nombre": "GitHub",
  "url": "https://github.com"
}
```

`order`: 1 recientes, 2 antiguas, 3 nombre descendente y 4 ascendente.

## Perfil

Todas requieren sesión.

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/perfil` | Consulta campos públicos |
| PATCH | `/perfil` | Actualiza nombre, usuario e imagen |
| PATCH | `/perfil/password` | Cambia contraseña e invalida tokens anteriores |

## Cliente frontend

`api.get`, `api.post`, `api.patch` y `api.delete` devuelven el contrato exitoso
o lanzan `ApiError`. No devuelven objetos ambiguos `{ error: true }`.

```js
try {
  const { data } = await api.get("plataformas");
} catch (error) {
  if (error.code === "SESSION_INVALID") {
    // La sesión ya fue limpiada por el cliente común.
  }
  console.error(error.status, error.code, error.requestId);
}
```

`ApiError` expone `status`, `code`, `message`, `details` y `requestId`. Los
errores de conectividad usan `status: 0` y `code: "NETWORK_ERROR"`.

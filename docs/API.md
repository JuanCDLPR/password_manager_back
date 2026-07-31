# Referencia de la API

## Convenciones

- URL local: `http://localhost:3024`.
- JSON con límite de 10 KB.
- Ruta privada: `Administracion: <token>`.
- Respuesta:

```json
{
  "codigo": 200,
  "estatus": "ok",
  "mensaje": "Descripción",
  "data": []
}
```

Los códigos HTTP y `codigo` son consistentes: 201 creación, 400 validación, 401
sesión/credenciales, 403 CORS, 404 ausencia, 409 conflicto y 429 límite.

## Usuarios

### `POST /usuarios/registrar`

Pública y limitada a 5 intentos por 15 minutos.

```json
{
  "name": "Usuario Demo",
  "user": "usuario.demo",
  "password": "ClaveSegura!1"
}
```

Nombre: 2–100 caracteres. Usuario: 3–50, letras, números, punto, guion o guion
bajo. Contraseña: 12–128 caracteres. Respuesta exitosa: HTTP 201.

### `POST /usuarios/auth`

Pública y limitada a 10 intentos por 15 minutos.

```json
{
  "user": "usuario.demo",
  "password": "ClaveSegura!1"
}
```

Entrega `name`, `user` y `token`. Credenciales incorrectas: HTTP 401.

### `POST /usuarios/refresh`

Privada y limitada a 10 intentos por 15 minutos.

```json
{
  "password": "ClaveSegura!1"
}
```

Entrega el JWT nuevo en `data[0]`. La contraseña no aparece en query strings.

## Plataformas

Todas requieren autenticación y operan únicamente sobre datos del propietario.

| Método y ruta | Entrada |
| --- | --- |
| `POST /plataformas/insertar` | Body: `nombre`, `url?` |
| `GET /plataformas/listar` | Query: `query`, `Order` |
| `GET /plataformas/consultar` | Query: `ID` |
| `POST /plataformas/actualizar` | Body: `id`, `nombre`, `url?` |
| `POST /plataformas/eliminar` | Query: `ID` |

`url`, si existe, debe ser HTTP o HTTPS. `Order`: 1 recientes, 2 antiguas, 3
nombre descendente y 4 nombre ascendente.

## Perfil

### `GET /perfil/consultar`

Devuelve únicamente `name`, `user`, `img`, `fecha` y `actualizado`.

### `POST /perfil/actualizar`

```json
{
  "nombre": "Nuevo nombre",
  "usuario": "nuevo_usuario",
  "url": "https://example.com/avatar.png"
}
```

Devuelve datos públicos y un JWT vigente en `data[0]`.

### `POST /perfil/update_pass`

```json
{
  "old_pass": "ClaveAnterior!1",
  "pass": "ClaveNuevaSegura!1",
  "rep_pass": "ClaveNuevaSegura!1"
}
```

El backend comprueba longitud, coincidencia y contraseña anterior. Al completar,
invalida todos los tokens anteriores y devuelve uno nuevo en `data[0]`.

## Pendientes

No existen todavía rutas de grupos, accesos o credenciales.


# Referencia de la API

## Convenciones

- URL local recomendada para integrarse con el frontend:
  `http://localhost:3024`.
- Cuerpo de las peticiones: JSON.
- Autenticación privada: `Administracion: <token>`.
- El código funcional se incluye también dentro del JSON:

```json
{
  "codigo": 200,
  "estatus": "OK",
  "mensaje": "Descripción del resultado",
  "data": []
}
```

Algunos errores funcionales actuales responden con HTTP `200` y un `codigo`
distinto de `200`. El consumidor debe revisar ambos valores hasta que se
normalice el contrato.

## Usuarios

### `POST /usuarios/registrar`

Pública. Crea una cuenta.

```json
{
  "name": "Usuario Demo",
  "user": "demo",
  "password": "secreto"
}
```

Respuestas observadas:

- HTTP 200 / código 200: usuario creado.
- HTTP 400 / código 400: el usuario ya existe.
- HTTP 500 / código 500: error de persistencia.

### `POST /usuarios/auth`

Pública. Autentica y entrega un JWT válido durante 6 horas.

```json
{
  "user": "demo",
  "password": "secreto"
}
```

Respuesta exitosa:

```json
{
  "codigo": 200,
  "estatus": "ok",
  "mensaje": "insertado correctamente",
  "data": {
    "name": "Usuario Demo",
    "user": "demo",
    "token": "<jwt>"
  }
}
```

Las credenciales incorrectas se informan actualmente con HTTP 200 y código 403.

### `GET /usuarios/refresh?pass_confirm=...`

Privada. Solicita la contraseña actual y devuelve un token nuevo en `data[0]`.
Actualmente la contraseña viaja como query string; esto debe cambiarse a un
`POST` con cuerpo JSON para evitar su aparición en historiales y logs.

## Plataformas

Todas las rutas requieren autenticación.

| Método y ruta | Entrada | Resultado |
| --- | --- | --- |
| `POST /plataformas/insertar` | Body: `nombre`, `url?` | Crea una plataforma para `req.uid` |
| `GET /plataformas/listar` | Query: `query`, `Order` | Lista las plataformas del usuario |
| `GET /plataformas/consultar` | Query: `ID` | Devuelve la plataforma en `data[0]` |
| `POST /plataformas/actualizar` | Body: `id`, `nombre`, `url?` | Actualiza una plataforma |
| `POST /plataformas/eliminar` | Query: `ID` | Elimina una plataforma |

Valores de `Order`:

| Valor | Orden |
| --- | --- |
| `1` | Más recientes |
| `2` | Más antiguas |
| `3` | Nombre descendente |
| `4` | Nombre ascendente |

Ejemplo de creación:

```json
{
  "nombre": "GitHub",
  "url": "https://github.com"
}
```

> [!WARNING]
> Consultar, actualizar y eliminar no validan actualmente la propiedad del
> registro. Un usuario autenticado que conozca otro `_id` podría operar sobre
> un documento ajeno.

## Perfil

Todas las rutas requieren autenticación.

### `GET /perfil/consultar`

Devuelve el documento del usuario en `data[0]`. En el estado actual también
serializa el campo `password`; debe excluirse antes de exponer la API.

### `POST /perfil/actualizar`

```json
{
  "nombre": "Nuevo nombre",
  "usuario": "nuevo_usuario",
  "url": "https://ejemplo.com/avatar.png"
}
```

Devuelve nombre, usuario y un JWT actualizado en `data[0]`.

### `POST /perfil/update_pass`

```json
{
  "old_pass": "secreto-anterior",
  "pass": "secreto-nuevo",
  "rep_pass": "secreto-nuevo"
}
```

Devuelve el nuevo JWT en `data[0]`. El backend recibe `rep_pass`, pero
actualmente no comprueba que coincida con `pass`; esa comparación solo existe
en el frontend.

## Rutas aún no disponibles

El frontend intenta consumir CRUD bajo `/grupos`, pero el backend no registra
ese router. Tampoco existen endpoints para accesos o credenciales.


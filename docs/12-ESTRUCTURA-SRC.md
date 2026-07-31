# 12. Organización del código en `src`

Actualizado el 30 de julio de 2026.

Todo el código ejecutable del backend vive en `src/`. La raíz conserva
únicamente configuración del proyecto, documentación, pruebas y archivos
estáticos.

## Estructura

```text
src/
├── app.js
├── server.js
├── config/
│   └── env.js
├── database/
│   └── mongo.js
├── modules/
│   ├── admin/
│   ├── auth/
│   ├── email/
│   │   └── templates/
│   ├── invitations/
│   ├── platforms/
│   ├── profile/
│   └── users/
├── shared/
│   ├── http/
│   ├── middleware/
│   └── validation/
└── scripts/
```

`docs/`, `public/` y `test/` permanecen en la raíz porque no forman parte del
runtime de la API.

## Anatomía de un módulo

Un módulo puede contener:

```text
feature/
├── feature.model.js
├── feature.service.js
├── feature.controller.js
└── feature.routes.js
```

- `model`: esquema y persistencia Mongoose.
- `service`: lógica reutilizable que no depende de Express.
- `controller`: caso de uso HTTP y coordinación.
- `routes`: paths, middlewares y controlador correspondiente.

No todos los módulos necesitan las cuatro piezas. `admin`, por ejemplo, solo
compone rutas protegidas; `email` contiene servicios y templates.

## Reglas de dependencia

1. `shared` nunca importa módulos de negocio.
2. Un módulo usa `shared` para HTTP, middleware y validación.
3. Las dependencias entre módulos deben ser explícitas y apuntar al archivo
   concreto; no existen índices globales con efectos secundarios.
4. `app.js` monta rutas, pero no contiene consultas ni reglas de negocio.
5. `server.js` es el único entrypoint que conecta la base y abre el puerto.
6. Los scripts operativos reutilizan módulos; no duplican modelos ni conexión.
7. Los tests importan desde `src` y nunca requieren iniciar `server.js`.

## Entry points

| Comando | Archivo |
| --- | --- |
| `npm start` | `src/server.js` |
| `npm run dev` | `src/server.js` mediante Nodemon |
| `npm run check` | `src/app.js` y `src/server.js` |
| `npm run bootstrap:admin` | `src/scripts/bootstrap-admin.js` |
| `npm run mail:test` | `src/scripts/send-test-email.js` |

Separar `app.js` de `server.js` permite probar Express sin conectarse a MongoDB
ni abrir un puerto fijo.

## Agregar una funcionalidad

Para incorporar grupos, accesos o recuperación de contraseña:

1. crea una carpeta dentro de `src/modules/`;
2. mantén modelo, servicio, controlador y rutas juntos;
3. coloca únicamente utilidades verdaderamente compartidas en `src/shared/`;
4. monta la ruta desde `src/app.js`;
5. agrega pruebas en `test/`;
6. crea la siguiente documentación numerada y enlázala desde `docs/README.md`.

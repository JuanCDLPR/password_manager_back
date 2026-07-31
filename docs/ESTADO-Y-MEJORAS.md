# Estado actual y mejoras

## Evaluación funcional

| Área | Estado | Observación |
| --- | --- | --- |
| Registro e inicio de sesión | Funcional con riesgos | JWT de 6 horas; contraseña almacenada con cifrado reversible |
| Renovación de sesión | Parcial | Funciona desde la UI, pero envía la contraseña en la URL |
| Perfil | Funcional con riesgos | Consulta y edición; la respuesta expone el campo `password` |
| Plataformas | Funcional | CRUD, búsqueda y ordenamiento |
| Aislamiento por usuario | Parcial | La lista filtra por usuario; consulta/edición/borrado no |
| Grupos | Solo frontend | No hay rutas, controlador ni modelo en la API |
| Accesos/credenciales | No implementado | No existe pantalla, endpoint ni modelo |
| Dashboard | Provisional | Renderiza `asdasd` |
| Pruebas y CI | No implementado | No hay archivos de prueba ni pipeline |
| Documentación | Base creada | README y documentos técnicos en este cambio |

## Lo que está bien encaminado

- Separación básica entre rutas, controladores, modelos, middleware y helpers.
- Modelos de usuario y plataforma pequeños y comprensibles.
- Protección JWT aplicada a todas las rutas privadas existentes.
- Las plataformas se asignan al usuario autenticado al crearse y la lista se
  filtra por propietario.
- Frontend organizado por módulos, con componentes compartidos para tablas,
  búsqueda, ordenamiento y estados de carga.
- Flujo de perfil y renovación de token ya integrado entre ambos repositorios.
- `.env` está excluido del repositorio y existe un archivo de ejemplo.

## Prioridad 0: seguridad antes de datos reales

1. **Corregir autorización por objeto (IDOR).** Incluir siempre
   `{ _id: ID, id_usuario: req.uid }` al consultar, actualizar o eliminar una
   plataforma. Aplicar el mismo patrón a futuros grupos y accesos.
2. **Aplicar hashing a la contraseña de la cuenta.** Usar Argon2id o bcrypt con
   salt; una contraseña de autenticación no debe poder descifrarse.
3. **Quitar la contraseña del JWT.** El token debería contener un identificador
   mínimo (`sub`) y, si hace falta invalidación, una versión de sesión.
4. **Excluir secretos de respuestas.** Configurar el modelo para no devolver
   `password` y seleccionar explícitamente campos públicos en `/perfil`.
5. **Rediseñar el almacenamiento de credenciales.** Para un gestor real,
   derivar una clave desde la contraseña maestra con un KDF robusto y cifrar el
   contenido de la bóveda con cifrado autenticado. Preferentemente el cifrado y
   descifrado ocurren en el cliente y el servidor nunca recibe la clave.
6. **Mover la renovación a `POST`.** No enviar contraseñas en query strings.
7. **Agregar validación y límites.** Validar tipos, longitud, formato de URL e
   identificadores; limitar tamaño del body; añadir rate limiting al login y
   cabeceras seguras con Helmet.
8. **Restringir CORS y exigir HTTPS.** Configurar orígenes permitidos por
   entorno y no desplegar autenticación sobre HTTP.

## Prioridad 1: terminar el producto

1. Diseñar el modelo de **credencial/acceso**: propietario, plataforma, grupo,
   nombre de usuario, secreto cifrado, notas y fechas.
2. Implementar CRUD de accesos con revelado/copiado controlado y generador de
   contraseñas.
3. Completar el backend de grupos o retirar temporalmente la opción de la UI.
4. Crear un dashboard útil: total de accesos, grupos, contraseñas antiguas y
   alertas; eliminar el contenido provisional.
5. Corregir navegación no implementada y estados vacíos/errores.
6. Añadir una estrategia de recuperación que no debilite el cifrado de la
   bóveda y documentar claramente sus consecuencias.

## Prioridad 2: calidad y mantenibilidad

### Backend

- Eliminar o aislar `config-db.js`, `usuarios.controller.js` y la dependencia
  `mysql` si la migración a MongoDB ya es definitiva.
- Añadir `start`, declarar `nodemon` como dependencia de desarrollo y definir
  una versión de Node en `engines` o `.nvmrc`.
- Incorporar un manejador central de errores y controladores más pequeños.
- Usar códigos HTTP consistentes: 201 al crear, 400 para validación, 401 para
  autenticación, 403 para autorización y 404 para ausencias.
- Añadir índices únicos en MongoDB (por ejemplo, `user`) y manejar duplicados
  de forma atómica.
- Validar que `pass` y `rep_pass` coincidan también en servidor.
- Añadir endpoint de salud y cierre ordenado de servidor/conexión.

### Frontend

- Sustituir `BACKEND_URL` fija por `REACT_APP_API_URL` o una configuración
  equivalente por entorno.
- Unificar los tres wrappers de `fetch`, encabezados y manejo de errores.
- No usar `localStorage.clear()` al cerrar sesión; eliminar solo claves propias.
- Considerar cookies `HttpOnly`, `Secure` y `SameSite` para la sesión, según el
  diseño final de autenticación.
- Corregir comparaciones no estrictas, mutaciones directas de objetos de error,
  textos/errores ortográficos y `console.log` residuales.
- Configurar el servidor de producción con fallback a `index.html` para rutas
  de React Router.
- Migrar desde Create React App, actualmente en mantenimiento, a una herramienta
  activa como Vite cuando se planifique la modernización.
- Revisar dependencias duplicadas o innecesarias (Material UI, Bootstrap,
  styled-components y Emotion conviven en el mismo cliente).

## Pruebas recomendadas

### Backend

- Unitarias para cifrado/validación y servicios.
- Integración de registro, login, expiración y renovación.
- Autorización: un usuario nunca puede leer, editar o borrar datos de otro.
- Validación de payloads y códigos HTTP.
- Base MongoDB efímera para evitar afectar datos reales.

### Frontend

- Formularios de login, registro, perfil y cambio de contraseña.
- Rutas públicas y privadas.
- Listado, búsqueda, orden y CRUD de plataformas.
- Expiración/renovación de sesión y errores de red.
- Pruebas de accesibilidad para navegación, formularios y diálogos.

## Secuencia sugerida

1. Cerrar los hallazgos de seguridad de Prioridad 0.
2. Definir el modelo criptográfico y el contrato de accesos.
3. Normalizar API/configuración y añadir una primera suite de integración.
4. Implementar accesos y grupos de extremo a extremo.
5. Completar dashboard, experiencia de usuario y pruebas del frontend.
6. Añadir CI, despliegue por entornos, monitoreo, backups y procedimiento de
   migración.


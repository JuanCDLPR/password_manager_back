# Seguridad

## Controles implementados

| Control | Implementación |
| --- | --- |
| Contraseña de cuenta | bcrypt con salt y costo 12 |
| JWT mínimo | Solo `sub`, `ver` y claims estándar |
| Invalidación | `tokenVersion` aumenta al cambiar contraseña |
| Campos sensibles | `select: false`, transformación JSON y selección explícita |
| Autorización | `_id` + `id_usuario` en cada operación por documento |
| Entradas | Tipos, longitudes, ObjectId y URL HTTP/HTTPS |
| NoSQL/regex | Campos permitidos y búsqueda con metacaracteres escapados |
| Fuerza bruta | Rate limits separados para registro, login y renovación |
| HTTP | Helmet, `x-powered-by` deshabilitado y body de 10 KB |
| CORS | Lista de orígenes mediante `CORS_ORIGINS` |
| Trazabilidad | `X-Request-Id` y `requestId` en todos los errores |
| Errores | Contrato central sin stacks ni datos internos |
| Logging | No registra body, JWT ni Authorization; redacta query sensible |
| Dependencias | `npm audit`: 0 vulnerabilidades tras actualización |
| Base de datos | Cadena únicamente en `BD_CNN`, `.env` ignorado por Git |

## Verificación realizada

El 30 de julio de 2026 se ejecutó una prueba integral contra la base configurada:

- registro y login de dos usuarios temporales;
- contraseña confirmada como hash bcrypt costo 12;
- lectura cruzada de plataforma rechazada con 404;
- perfil sin `password` ni `tokenVersion`;
- renovación mediante POST;
- token anterior rechazado después del cambio de contraseña;
- origen CORS no autorizado rechazado con 403.

Los datos temporales se eliminaron al finalizar. La base `PasswordManager` quedó
con **0 colecciones**. La eliminación completa no es recuperable desde la
aplicación; solo un backup externo del proveedor podría restaurarla.

## Riesgos pendientes

1. El JWT sigue en `localStorage`, por compatibilidad con el cliente actual.
   Migrar a cookie `HttpOnly`, `Secure` y `SameSite` requiere protección CSRF y
   configuración de credenciales CORS.
2. El gestor todavía no almacena secretos. Antes de crear accesos se debe
   definir una bóveda con cifrado autenticado y derivación robusta de clave,
   idealmente ejecutados en el cliente.
3. HTTPS debe terminar en el proxy/plataforma de producción.
4. Conviene rotar `SEED_TOKEN` al desplegar y almacenarlo en un secret manager.
5. Falta logging de seguridad sin datos sensibles, monitoreo y alertas.
6. Faltan pruebas de integración automatizadas con una base efímera y CI.

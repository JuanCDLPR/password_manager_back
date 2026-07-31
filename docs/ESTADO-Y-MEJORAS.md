# Estado y mejoras

## Estado actual

| Área | Estado |
| --- | --- |
| Registro/login | Implementado y endurecido |
| Renovación | POST seguro e integrado |
| Perfil | Implementado; campos sensibles excluidos |
| Plataformas | CRUD con aislamiento por usuario |
| MongoDB | Única base soportada |
| Pruebas | Suite unitaria inicial + prueba integral ejecutada |
| Grupos | Solo frontend |
| Accesos/credenciales | No implementado |
| Dashboard | Provisional |
| CI/despliegue | Pendiente |

## Completado en seguridad

- Hash bcrypt y eliminación del cifrado reversible.
- JWT sin contraseña y con versión de sesión.
- Autorización por propietario para todo el CRUD.
- Renovación por POST.
- Validación de entradas en servidor.
- CORS por entorno, Helmet, límite de body y rate limiting.
- Códigos HTTP consistentes.
- Índice único de usuario y validación atómica de duplicados.
- Eliminación de MySQL, CryptoJS y código heredado.
- URL del frontend mediante `REACT_APP_API_URL`.
- Cliente HTTP unificado y cierre de sesión sin limpiar datos ajenos.
- Dependencias del backend con auditoría en cero.

## Próxima prioridad: diseño de la bóveda

Antes de crear el módulo de accesos hay que decidir:

1. Modelo de amenaza y política de recuperación.
2. Contraseña maestra separada o derivación desde la cuenta.
3. KDF resistente (Argon2id o equivalente).
4. Cifrado autenticado por registro o por bóveda.
5. Qué metadatos ve el servidor.
6. Rotación de claves, exportación y backups.

La recomendación es cifrado/descifrado del lado cliente para que el servidor no
conozca ni la clave ni los secretos.

## Mejoras posteriores

- Migrar sesión a cookies HttpOnly con defensa CSRF.
- Implementar accesos y grupos de extremo a extremo.
- Sustituir el dashboard provisional.
- Añadir pruebas de integración automatizadas, frontend y accesibilidad.
- Incorporar linting, formato, CI, monitoreo y backups.
- Añadir fallback de React Router al servidor de producción.
- Diagnosticar o sustituir el build de Create React App: en la validación actual
  `react-scripts build` quedó activo sin finalizar ni emitir salida.
- Evaluar migración de Create React App a Vite.
- Revisar y reducir librerías de UI duplicadas.

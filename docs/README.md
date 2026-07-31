# Documentación del proyecto

Esta carpeta documenta el estado observado del backend y su integración con el
frontend al **30 de julio de 2026**. Describe el código existente; no implica
que las funciones pendientes ya estén implementadas.

## Contenido

- [Arquitectura](ARQUITECTURA.md): componentes, flujos, persistencia y relación
  entre ambos repositorios.
- [Referencia de la API](API.md): autenticación, endpoints, parámetros y
  respuestas.
- [Estado y mejoras](ESTADO-Y-MEJORAS.md): alcance real, hallazgos técnicos,
  riesgos y propuesta de evolución.
- [README del backend](../README.md): instalación y uso del servidor.
- [README del frontend](../../password_manager/README.md): instalación y uso
  del cliente cuando ambos repositorios están en carpetas hermanas.

## Resumen ejecutivo

El proyecto ya tiene una base funcional para cuentas, sesiones, perfil y
catálogo de plataformas. El frontend incluye pantallas completas para esas
áreas y plantillas para grupos. Sin embargo, aún falta la pieza central de un
gestor de contraseñas: guardar credenciales de acceso asociadas a plataformas.

Antes de publicar o almacenar información sensible se deben corregir los
controles de propiedad de registros, sustituir el cifrado reversible de la
contraseña de inicio de sesión por hashing, retirar datos sensibles del JWT y
de las respuestas, validar entradas y añadir pruebas.


# 05. Ambientes y bases de datos

Actualizado el 30 de julio de 2026.

El proyecto usa exclusivamente MongoDB. Una misma cuenta o clúster de Atlas
puede contener bases separadas, pero cada despliegue debe declarar su nombre:

| Ambiente | `NODE_ENV` | Ejemplo de `MONGODB_DB_NAME` |
| --- | --- | --- |
| Desarrollo local | `development` | `PasswordManagerDev` |
| Pruebas | `test` | `PasswordManagerTest` |
| Producción | `production` | `PasswordManager` |

`PRODUCTION_DB_NAME` identifica la base que nunca debe abrirse desde desarrollo
o pruebas. El arranque se detiene si:

- producción no usa exactamente `PRODUCTION_DB_NAME`;
- desarrollo o pruebas intentan usar la base de producción;
- una base de pruebas no contiene `test` en su nombre.

`BD_CNN` conserva la URI del clúster y `MONGODB_DB_NAME` selecciona la base.
Esto permite usar credenciales distintas en producción sin fijarlas en código.

No se deben ejecutar pruebas automáticas contra bases persistentes. Los cambios
de esta etapa no eliminan, renombran ni migran usuarios existentes.

## Vercel

Configura las variables por ambiente desde la plataforma. En producción usa
`NODE_ENV=production`, `MONGODB_DB_NAME=PasswordManager` y secretos diferentes
a los locales. Los valores reales nunca deben agregarse a Git.

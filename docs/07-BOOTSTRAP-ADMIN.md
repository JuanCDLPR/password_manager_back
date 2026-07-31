# 07. Creación del primer superadministrador

Actualizado el 30 de julio de 2026.

El superadministrador no se crea desde el registro público ni se codifica en el
repositorio. Se genera una sola vez desde un entorno confiable:

```bash
npm run bootstrap:admin
```

El comando:

1. valida el ambiente y la base seleccionada;
2. se detiene si ya existe cualquier `superadmin`;
3. solicita nombre, correo, usuario y contraseña;
4. oculta la contraseña en una terminal interactiva;
5. en producción exige escribir el nombre de la base para confirmar;
6. crea una cuenta activa con hash bcrypt.

No promueve, modifica ni elimina usuarios existentes. En ejecución no
interactiva la contraseña puede suministrarse temporalmente mediante
`BOOTSTRAP_ADMIN_PASSWORD`; no debe guardarse en `.env`, historial o Git.

Después de crearlo, inicia sesión normalmente y consulta `GET /admin` con el
Bearer token. El panel visual se agregará en una etapa posterior.

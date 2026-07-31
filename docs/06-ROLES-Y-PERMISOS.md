# 06. Roles, estados y acceso administrativo

Actualizado el 30 de julio de 2026.

## Cuenta

Los nuevos registros requieren `name`, `user`, `email` y `password`. El backend
asigna siempre `role=user` y `status=active`; ignora cualquier intento del
cliente de registrarse como administrador.

Los campos agregados son compatibles con documentos existentes:

- `email`: único cuando está presente;
- `role`: `user` o `superadmin`, con valor predeterminado `user`;
- `status`: `active` o `disabled`, con valor predeterminado `active`;
- `emailVerifiedAt`: fecha de verificación futura;
- `lastLoginAt`: último inicio de sesión correcto.

El inicio de sesión acepta usuario o correo. Los usuarios históricos sin correo
pueden seguir entrando con su nombre de usuario.

## Autorización

El JWT no contiene el rol. En cada solicitud privada el backend consulta al
usuario, valida `tokenVersion`, estado y rol, y construye `req.auth`. Esto evita
confiar en datos alterables del frontend.

`requireRole("superadmin")` protege las rutas administrativas. `GET /admin`
sirve como comprobación inicial y devuelve 403 a un usuario normal. La URL puede
ser visible: la seguridad depende del middleware, no de ocultarla.

Una cuenta `disabled` no puede iniciar sesión ni continuar usando un JWT.

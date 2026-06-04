# EP2.7 (b): Documentación endpoints

A continuación se resumen los endpoints reales del backend usados en la EP2. Incluyen salud, autenticación con JWT y gestión de reportes, con rutas protegidas por token y rol cuando corresponde.

## Salud

- `GET /api/health`: confirma que el backend está activo.
- `GET /api/db-health`: confirma que PostgreSQL responde.

## Autenticación

- `POST /api/auth/register`: registra ciudadano y guarda contraseña con bcrypt.
- `POST /api/auth/login`: valida credenciales y devuelve JWT.
- `GET /api/auth/me`: devuelve el usuario autenticado usando el token.

## Reportes

- `POST /api/reports`: crea un reporte como usuario autenticado.
- `GET /api/reports/my`: lista reportes del usuario autenticado.
- `GET /api/reports`: lista todos los reportes. Requiere rol `funcionario`.
- `GET /api/reports/:id`: muestra un reporte respetando permisos.
- `PATCH /api/reports/:id`: actualiza estado, urgencia o fecha programada. Requiere rol `funcionario`.
- `DELETE /api/reports/:id`: elimina un reporte. Requiere rol `funcionario`.

## Formato de respuesta

Las respuestas mantienen el formato:

```json
{
  "data": {},
  "error": null
}
```

Cuando hay error:

```json
{
  "data": null,
  "error": {
    "message": "Mensaje del error"
  }
}
```

## Validaciones principales

- `street`: obligatorio, máximo 160 caracteres.
- `description`: obligatorio.
- `urgency`: `baja`, `media` o `alta`.
- `status`: `pendiente`, `verificado`, `agendado`, `en_proceso` o `resuelto`.
- `scheduledDate`: opcional, en formato `YYYY-MM-DD`.
- Las rutas protegidas requieren `Authorization: Bearer <token>`.

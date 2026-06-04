# EP2.7 (a) y (c): Pruebas en Postman + Evidencia de pruebas

---

## 1. Registrar ciudadano
**Método:** `POST /api/auth/register`  
**Resultado esperado:** `201 Created` con token en la respuesta  
**Evidencia:**

![Prueba 1 - Registro de ciudadano](./screenshots/01.png)

---

## 2. Login ciudadano
**Método:** `POST /api/auth/login`  
**Resultado esperado:** `200 OK` con token  
**Evidencia:**

![Prueba 2 - Login ciudadano](./screenshots/02.png)

---

## 3. Crear reporte (como ciudadano)
**Método:** `POST /api/reports`  
**Auth:** Bearer token de ciudadano  
**Resultado esperado:** `201 Created`  
**Evidencia:**

![Prueba 3 - Crear reporte](./screenshots/03.png)

---

## 4. Mis reportes
**Método:** `GET /api/reports/my`  
**Auth:** Bearer token de ciudadano  
**Resultado esperado:** `200 OK` con array de reportes  
**Evidencia:**

![Prueba 4 - Mis reportes](./screenshots/04.png)

---

## 5. Ciudadano intenta acceder al panel admin
**Método:** `GET /api/reports`  
**Auth:** Bearer token de ciudadano  
**Resultado esperado:** `403 Forbidden`  
**Evidencia:**

![Prueba 5 - Acceso denegado (403)](./screenshots/05.png)

---

## 6. Login funcionario
**Método:** `POST /api/auth/login`  
**Resultado esperado:** `200 OK` con token de funcionario  
**Nota:** El usuario fue creado directamente en la BBDD.  
**Evidencia:**

![Prueba 6 - Login funcionario](./screenshots/06.png)

---

## 7. Funcionario lista todos los reportes
**Método:** `GET /api/reports`  
**Auth:** Bearer token de funcionario  
**Resultado esperado:** `200 OK` con todos los reportes  
**Evidencia:**

![Prueba 7 - Listar reportes (funcionario)](./screenshots/07.png)

---

## 8. Funcionario actualiza estado de reporte
**Método:** `PATCH /api/reports/1`  
**Auth:** Bearer token de funcionario  
**Resultado esperado:** `200 OK` con reporte actualizado  
**Evidencia:**

![Prueba 8 - Actualizar estado](./screenshots/08.png)

---

## 9. Historial refleja el cambio
**Método:** `GET /api/reports/1`  
**Auth:** Bearer token de funcionario  
**Resultado esperado:** `200 OK` con `statusHistory` mostrando `pendiente` -> `verificado`  
**Evidencia:**

![Prueba 9 - Historial de cambios](./screenshots/09.png)
# Proyecto Semestral ICI4247-1
### Integrantes: Esteban Schanze Cárdenas
## Municipalidad de Santo Domingo - Programa No+Cables

Esqueleto inicial (boilerplate + estructura de carpetas) para el proyecto semestral.

Ataca el desafío número 19: "Proliferación de cables de servicios (electricidad, telecomunicaciones) en desuso que generan contaminación visual y riesgos para la seguridad, con una compleja gestión para su retiro."

Sistema web/móvil para un hipotético programa de la municipalidad de Santo Domingo llamado "No+Cables". Permite a ciudadanos reportar cables eléctricos y de telecomunicaciones en desuso mediante fotos y geolocalización, y a funcionarios municipales gestionar esos reportes a través de un ciclo de vida completo: verificación, priorización, agendamiento de retiro y cierre con evidencia. Incluye un mapa interactivo con reportes georeferenciados, panel de estadísticas para funcionarios, notificaciones de estado, y autenticación por roles

## EP 1.1.1 Requerimientos funcionales

Roles: Ciudadano (Usuario), Funcionario (Administrador)

**RF1 – Registro de incidente por ciudadano**
El ciudadano puede crear un reporte indicando ubicación (manual o GPS), descripción del problema, nivel de urgencia percibido, y adjuntar una o más fotos de los cables en desuso en cuestión.

**RF2 – Visualización de reportes en mapa interactivo**
Ambos roles pueden acceder a un mapa (Google Maps) que muestre los reportes georeferenciados, diferenciados visualmente por estado (pendiente, verificado, agendado, en proceso, resuelto).

**RF3 – Gestión y triage de reportes por el funcionario**
El funcionario puede ver el listado completo de reportes, cambiar su estado (pendiente -> verificado -> agendado -> en proceso -> resuelto), asignar prioridad (alta/media/baja) y agregar comentarios internos.

**RF4 – Agenda de retiros y calendario de operaciones**
El funcionario puede programar fechas de intervención para los reportes verificados. El ciudadano puede ver la fecha estimada de retiro de su reporte.

**RF5 – Seguimiento del estado de reportes por el ciudadano**
El ciudadano puede consultar el historial y estado actual de sus propios reportes, incluyendo actualizaciones del funcionario y fecha de intervención programada.

**RF6 – Sistema de notificaciones vía email**
El ciudadano recibe notificaciones (correo electrónico) cuando su reporte cambia de estado, cuando se agenda el retiro, o cuando se marca como resuelto.

**RF7 – Cierre de caso con evidencia**
El funcionario puede adjuntar una foto del "después" al cerrar un reporte, que el ciudadano puede ver.

## EP 1.1.2 Requerimientos no funcionales

...

# Stack

**Frontend:** Ionic con React y TypeScript, empaquetado con Vite  
**Backend:** Flask (Python)

## Frontend

```bash
npm install
npm run dev
npm run build
```

Frontend queda disponible en `http://localhost:5173`.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cd ..
flask --app backend.app:create_app --debug run
```

Backend queda disponible en `http://localhost:5000/api`.

Endpoint de prueba:

```bash
GET http://localhost:5000/api/health
```

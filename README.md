# Proyecto semestral ICI4247-1
### Integrantes: Esteban Schanze Cárdenas
## Municipalidad de Santo Domingo - Programa No+Cables

Esqueleto inicial (boilerplate + estructura de carpetas) para el proyecto semestral. Ataca el desafío número 19: "Proliferación de cables de servicios (electricidad, telecomunicaciones) en desuso que generan contaminación visual y riesgos para la seguridad, con una compleja gestión para su retiro."

Sistema web/móvil para un hipotético programa de la municipalidad de Santo Domingo llamado "No+Cables". Permite a ciudadanos reportar cables eléctricos y de telecomunicaciones en desuso mediante fotos y geolocalización, y a funcionarios municipales gestionar esos reportes a través de un ciclo de vida completo: verificación, priorización, agendamiento de retiro y cierre con evidencia. Incluye un mapa interactivo con reportes georeferenciados, panel de estadísticas para funcionarios, notificaciones de estado, y autenticación por roles

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

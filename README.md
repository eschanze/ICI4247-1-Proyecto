# Proyecto Semestral ICI4247-1
### Integrantes: Esteban Schanze Cárdenas
## Municipalidad de Santo Domingo - Programa No+Cables

Proyecto semestral con frontend Ionic React y backend Express/PostgreSQL para la entrega EP2.

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

Nota: No se cumplen para la EP1, ya que están pensandos para el proyecto terminado.

**RNF1 – Rendimiento** 
El mapa de reportes debe cargar y renderizar todos los marcadores en menos de 3 segundos con hasta 500 reportes activos. Las respuestas de la API REST no deben superar los 1000ms bajo carga normal.

**RNF2 – Seguridad** 
Toda comunicación debe realizarse sobre HTTPS. Las contraseñas deben almacenarse con hash. El acceso a endpoints del funcionario debe validarse mediante JWT con expiración definida. Los inputs deben sanitizarse para prevenir inyección SQL y XSS.

**RNF3 – Usabilidad**
La interfaz debe ser responsive y funcional tanto en versión móvil como web (coherente con Ionic). El flujo de creación de un reporte no debe requerir más de 4 pasos. Los estados de los reportes deben comunicarse visualmente de forma clara (colores, íconos).

## EP 1.2: Justificación y Usuario Objetivo

La acumulación de cables de telecomunicaciones en desuso y caídos en la vía pública ("escombreo áereo") representa una problemática crítica en los espacios urbanos. Esto no solo genera una severa contaminación visual, sino que supone riesgos estructurales por sobrecarga en los postes y un peligro inminente de accidentes para peatones y vehículos. Actualmente, la falta de canales de comunicación centralizados y de fácil acceso frustra los intentos de la comunidad por alertar sobre estas situaciones, lo que retrasa la acción de las autoridades y empresas responsables. (Desafío número 19)

El usuario objetivo principal de No+Cables es el ciudadano común de la comuna de Santo Domingo que, portando un teléfono inteligente o laptop, busca una herramienta rápida y sin burocracia para reportar estos peligros. Este usuario requiere una interfaz intuitiva que le permita geolocalizar el problema y adjuntar evidencia fotográfica en pocos segundos. Por otro lado, el usuario secundario es el administrador (personal municipal o técnico), quien necesita un dashboard centralizado y eficiente para recepcionar, priorizar la urgencia y actualizar el estado de los incidentes reportados por la ciudadanía.

## EP 1.3: Diseño de Interfaz y Experiencia de Usuario

Bocetos de UI/UX y prototipo interactivo en Figma se pueden encontrar en el siguiente proyecto:
[Prototipo Figma - No+Cables](https://www.figma.com/design/fJ4vtCmSt6opDan69fUWUu/Proyecto-IngWeb?node-id=0-1&t=dMWc85q3GuoEmk5D-1)

## EP 1.4: Definición de Arquitectura de Navegación y Experiencia del Usuario

### (a) Rutas principales y secundarias

El enrutamiento de la aplicación se maneja a través de `IonReactRouter` en el componente `AppRouter`.

**Rutas Principales:**
Aquellas directamente accesibles desde la navegación global (Header) y representan las funcionalidades core de la aplicación:
- `/inicio` (`LandingPage`): Página de bienvenida e información general del proyecto.
- `/mapa` (`MapPage`): Visualización geoespacial de los incidentes reportados.
- `/reportar` (`ReportPage`): Formulario principal para registrar un nuevo incidente de cables caídos/en desuso.
- `/mis-reportes` (`MyReportsPage`): Panel personal para hacer seguimiento de los reportes enviados.
- `/admin-reportes` (`AdminReportsPage`): Panel de administración general de incidentes.
- `/login` (`LoginPage`): Acceso al sistema mediante el backend real de autenticación.

**Rutas Secundarias:**
Aquellas a las que se accede mediante flujos específicos y no desde la navegación principal constante:
- `/registro` (`RegisterPage`): Creación de una nueva cuenta de usuario.

---

### (b) Relaciones jerárquicas entre vistas

La jerarquía de la aplicación es plana, lo que favorece una navegación rápida sin elementos o rutinas complejas que puedan confundir al usuario. 
- **Nivel 0 (Global):** `AppHeader` (Navegación principal) y `AppFooter` (Es la barra de navegación cuando se detecta un dispositivo móvil). Estos envuelven toda la aplicación.
- **Nivel 1 (Vistas principales):** Todas las páginas (Landing, Mapa, Reportar, Mis Reportes, etc.) son vistas hermanas de Nivel 1 renderizadas dentro de un `IonRouterOutlet`.
- **Nivel 2 (Componentes internos):** Formularios, listas de incidentes, tarjetas de estadísticas y contenedores modales que viven dentro de las vistas de Nivel 1.

---

### (c) Flujo de navegación entre funcionalidades

El flujo está diseñado intencionalmente de manera circular, permitiendo al usuario moverse libremente sin quedar "atrapado", apoyado por el `AppHeader` global.
1. **Flujo de Descubrimiento:** El usuario llega a `/inicio` -> Puede leer las estadísticas y luego navegar a `/mapa` para ver la situación actual.
2. **Flujo de Acción:** Desde cualquier vista, el usuario puede ir a `/reportar` para enviar un nuevo incidente. 
3. **Flujo de Gestión:** Tras reportar, el usuario puede navegar a `/mis-reportes` para ver el estado de su solicitud.
4. **Flujo de Autenticación:** Si se requiere iniciar sesión, navega a `/login` -> Si no tiene cuenta, fluye hacia `/registro` -> Al completar, retorna al flujo principal.

---

### (d) Diferenciación de acceso según roles

La interfaz se adapta dinámicamente según el rol del usuario autenticado:
- **Usuario Invitado (No autenticado):** Tiene acceso a las vistas públicas (`/inicio`, `/mapa`, `/login`, `/registro`). Si intenta reportar o revisar reportes, se redirige a `/login`.
- **Usuario Ciudadano (Rol: `ciudadano`):** Se ocultan los botones de Login/Registro. Se habilita el acceso a `/reportar` y `/mis-reportes` para crear y seguir sus incidentes personales.
- **Usuario Funcionario (Rol: `funcionario`):** Se ocultan las opciones ciudadanas y se despliega la pestaña exclusiva `/admin-reportes`, la cual le permite visualizar todos los incidentes del sistema, cambiar sus estados (ej. "En progreso", "Resuelto") y clasificar su urgencia.

---

### (e) Flujo de principales tareas (Task flow)

**Tarea Principal: Reportar un incidente**
1. El usuario hace clic en "Reportar" en la barra de navegación superior.
2. Se renderiza el `ReportPage`.
3. El usuario interactúa con el formulario: ingresa título, descripción, ubicación y adjunta una imagen de evidencia.
4. Hace clic en "Enviar Reporte".
5. El sistema valida los datos y envía el reporte al backend mediante `POST /api/reports`.
6. El usuario es redirigido a `/mis-reportes` o ve un mensaje de error si falla la API, cerrando el ciclo de la tarea.

**Tarea Secundaria: Gestión administrativa de un reporte**
1. El administrador ingresa a `/admin-reportes`.
2. Visualiza el dashboard con la tabla de incidentes reportados por los ciudadanos.
3. Identifica un incidente "Pendiente" y selecciona la acción "Actualizar Estado".
4. Cambia el estado a "En progreso".
5. La vista se actualiza inmediatamente reflejando el cambio en el sistema.

---

### (f) Puntos críticos de interacción

- **Formulario de Reporte (`ReportPage`):** Es la función principal de la aplicación. La validación en tiempo real y la retroalimentación visual (ej. botones deshabilitados, alertas de error) son fundamentales aquí para evitar reportes incompletos o datos basura.
- **Navegación Móvil (`AppHeader`):** Al reducirse el tamaño de la pantalla, la navegación cambia sus etiquetas de texto por iconos representativos (gracias a Flexbox). Es un punto crítico ya que no hay espacio y los usuarios deben poder entender la navegación sin texto.
- **Cambios de Estado (`AdminReportsPage` / `MyReportsPage`):** Las interacciones que mutan datos (como actualizar un estado de reporte) requieren una respuesta visual inmediata para confirmar al usuario que su acción tuvo efecto.

---

### (g) Coherencia de experiencia entre 3 dispositivos

Se adoptó un enfoque responsive utilizando los contenidos que se vieron en clase (Flexbox, Grid, etc.) e Ionic como librería principal de UI.
- **Móvil (Smartphones):** 
  - El Header oculta los textos y deja únicamente iconos para la navegación.
  - El Footer institucional se oculta completamente para priorizar el espacio vertical útil (contenido).
  - Componentes como estadísticas o formularios cambian de disposición horizontal a una columna vertical 100% (ej. grid `1fr`).
- **Tablets:**
  - El Header retoma las etiquetas de texto si el ancho lo permite (> 768px).
  - Se usa la propiedad max-width para evitar que el contenido de los contenedores se estire exageradamente, centrando la información.
  - Cuadrículas (Grids) de 2 o 3 columnas para estadísticas o listas de reportes.
- **Escritorio (Desktop):**
  - Aprovechamiento total del espacio horizontal con márgenes laterales amplios.
  - Se oculta el Footer (ya que no es necesaria la barra de navegación móvil).
  - Efectos hover para elementos interactivos (botones, enlaces), lo cual intenta replicar la retroalimentación que es posible con pantalla táctil.

---

### (h) Breve justificación técnica de las decisiones adoptadas

- **Usabilidad y Claridad Estructural:** Se optó por una arquitectura plana y componentes de navegación siempre visibles (Header) para simplificar la experiencia. El usuario siempre sabe dónde está y cómo volver. El diseño con bordes marcados, sombras sólidas y alto contraste favorece la legibilidad y deja claros cuáles son los elementos interactivos.
- **Eficiencia de Interacción:** En lugar de recargar la página completa, el uso de React Router y `IonRouterOutlet` permite transiciones casi instantáneas, simulando el rendimiento de una aplicación nativa.
- **Escalabilidad de la Arquitectura Frontend:** 
  - **CSS Centralizado:** El uso de un sistema de variables globales (`index.css`) permite escalar y mantener el tema visual de manera muy sencilla. No se usaron frameworks de utilidades para mantener el HTML lo más limpio posible.
  - **Context API:** La autenticación usa `AuthContext` con JWT entregado por el backend y persiste en `localStorage`. Los reportes usan `reportsApi.ts` para conectar con los endpoints reales del backend (`POST /api/reports`, `GET /api/reports/my`, `GET /api/reports`, `PATCH /api/reports/:id`).
  - **Componentización:** Se utilizó la estructura de carpetas sugerida por el profesor en clases. Se separaron las vistas por "Features" (ej. `/features/report/`, `/features/map/`) agrupando su lógica, vista y estilos. Esto facilita encontrar, modificar y probar componentes de forma aislada a medida que el proyecto crece.

---

## EP 2: Implementación backend e integración

### EP 2.1: Creación del servidor backend

Se creó un servidor Node.js con Express dentro de la carpeta `backend/`. La estructura de la aplicación en `backend/src/app.js` (configuración de Express, CORS, parseo JSON, y montaje de rutas) y `backend/src/server.js` (inicio del proceso). Las variables de entorno se centralizan en `backend/src/config/env.js` y se cargan desde un archivo `.env`. El servidor expone sus rutas bajo el prefijo `/api` y queda disponible en `http://localhost:5000/api`. Incluye manejo genérico de rutas no encontradas (404) y manejo de errores (500) que devuelven JSON consistente.

### EP 2.2: Base de datos relacional

Se integró PostgreSQL mediante el driver `pg`. La conexión se gestiona a través de un pool en `backend/src/db/pool.js`, y el esquema se define en `backend/src/db/schema.sql`, ejecutable con el script `npm run db:init` (que corre `backend/src/db/init-db.js`).

El modelo relacional contempla tres tablas:

**Tabla `users`**: usuarios del sistema (ciudadanos y funcionarios):

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| `id` | SERIAL | PRIMARY KEY |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE |
| `rut` | VARCHAR(12) | NOT NULL, UNIQUE |
| `email` | VARCHAR(120) | NOT NULL, UNIQUE |
| `password_hash` | TEXT | NOT NULL |
| `role` | VARCHAR(20) | NOT NULL, CHECK (`ciudadano`, `funcionario`) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**Tabla `reports`**: reportes de cables en desuso creados por ciudadanos:

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| `id` | SERIAL | PRIMARY KEY |
| `user_id` | INTEGER | NOT NULL, FK → users(id) ON DELETE CASCADE |
| `street` | VARCHAR(160) | NOT NULL |
| `description` | TEXT | NOT NULL |
| `urgency` | VARCHAR(20) | NOT NULL, CHECK (`baja`, `media`, `alta`) |
| `status` | VARCHAR(20) | NOT NULL, DEFAULT `pendiente`, CHECK (`pendiente`, `verificado`, `agendado`, `en_proceso`, `resuelto`) |
| `scheduled_date` | DATE | Nullable |
| `photo_url` | TEXT | Nullable |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

**Tabla `report_status_history`**: historial de cambios de estado de cada reporte

| Columna | Tipo | Restricciones |
| --- | --- | --- |
| `id` | SERIAL | PRIMARY KEY |
| `report_id` | INTEGER | NOT NULL, FK → reports(id) ON DELETE CASCADE |
| `status` | VARCHAR(20) | NOT NULL, CHECK (`pendiente`, `verificado`, `agendado`, `en_proceso`, `resuelto`) |
| `comment` | TEXT | Nullable |
| `changed_by_user_id` | INTEGER | NOT NULL, FK → users(id) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() |

Además se definieron índices para las consultas más frecuentes (`reports.user_id`, `reports.status`, `report_status_history.report_id`) y un trigger `set_updated_at` que actualiza automáticamente la columna `updated_at` de `reports` ante cada `UPDATE`.

### EP 2.3: API REST

Se implementaron endpoints organizados en tres archivos de rutas (`health.routes.js`, `auth.routes.js`, `reports.routes.js`). Entre autenticación, salud y reportes se cubren los cuatro verbos HTTP requeridos: `GET`, `POST`, `PATCH` y `DELETE`. Todas las respuestas siguen un formato JSON `{ data, error }` y se usan códigos HTTP de forma consistente (`201`, `400`, `401`, `403`, `404`, `409`, `500`).

La documentación completa de cada endpoint, incluyendo rutas, métodos, permisos requeridos y validaciones de cada campo, se encuentra en [`endpoints.md`](endpoints.md).

### EP 2.4: Consumo de la API desde Ionic React

El frontend consume la API mediante tres módulos en `src/core/api/`:

- **`apiClient.ts`**: cliente HTTP centralizado que utiliza `fetch`. Lee la URL del backend desde `VITE_API_URL` (o usa `localhost:5000/api` por defecto), adjunta el token JWT como header `Authorization: Bearer` cuando se le pasa, y normaliza los errores del backend en una clase `ApiError` con `status` y `message`. Maneja errores de red (servidor caído) y respuestas no-JSON de forma separada.
- **`authApi.ts`**: funciones `login`, `register` y `getMe` que usan `apiClient` para las llamadas de autenticación.
- **`reportsApi.ts`**: funciones `createReport`, `getMyReports`, `getAllReports`, `getReportById`, `updateReport` y `deleteReport` que cubren el CRUD completo de reportes.

Cada pantalla del frontend (`ReportPage`, `MyReportsPage`, `AdminReportsPage`) muestra estados de carga y errores mediante toasts de Ionic. El token se obtiene desde `AuthContext` y se pasa a cada llamada API.

### EP 2.5: Autenticación con JWT

**(a) Formularios de registro e inicio de sesión:**
La pantalla `/login` (`LoginPage`) permite ingresar usuario/email y contraseña, y llama a `POST /api/auth/login`. La pantalla `/registro` (`RegisterPage`) solicita username, RUT, email y contraseña, y llama a `POST /api/auth/register`. Ambos formularios manejan errores del backend y muestran mensajes al usuario.

**(b) Rutas protegidas en frontend:**
La protección se implementa dentro de cada página. `ReportPage`, `MyReportsPage` y `AdminReportsPage` verifican si el usuario está autenticado y si su rol corresponde; en caso contrario, redirigen a `/login` o `/inicio`. El `AppHeader` adapta dinámicamente los enlaces de navegación según el rol del usuario.

**(c) Generación y validación de JWT:**
El backend genera tokens con `jsonwebtoken` incluyendo `id`, `username` y `role` del usuario, con expiración de 8 horas. El middleware `requireAuth` en `backend/src/middleware/auth.middleware.js` valida el token en cada request protegida, extrayendo los datos del usuario y adjuntándolos a `req.user`. El frontend persiste el token en `localStorage` y lo restaura al recargar la página validándolo contra `GET /api/auth/me`.

**(d) Diferenciación por roles:**
Existen dos roles: `ciudadano` y `funcionario`. El registro público siempre crea ciudadanos (el rol se fuerza en el backend); los funcionarios se crean de forma controlada en la base de datos. **Para facilitar la evaluación de la EP2, `npm run db:init` deja creada una cuenta demo de funcionario con contraseña hasheada usando bcrypt.** El middleware `requireFuncionario` bloquea con `403` las rutas administrativas si el token no pertenece a un funcionario. En el frontend, el `AuthContext` expone el rol del usuario para adaptar la navegación y las vistas.

### EP 2.6: Validación y seguridad

**(a) Validación de inputs:**
El backend valida los datos de entrada antes de cualquier operación. En registro: largo de username (3-50), formato de email, largo mínimo de contraseña (6 caracteres) y validación del RUT (algoritmo digito de verificación). En reportes: `street` (dirección) obligatoria (máx. 160 caracteres), `description` obligatoria, `urgency` restringida a valores permitidos, `status` restringido a valores permitidos, y `scheduledDate` en formato `YYYY-MM-DD` cuando se envía. Los errores de validación responden con `400` y un mensaje específico.

**(b) Hash de contraseñas:**
Las contraseñas se almacenan exclusivamente como hash usando `bcryptjs` con factor de costo 10. En login se comparan con `bcrypt.compare`. El campo `password_hash` nunca se incluye en las respuestas JSON de la API (la función `publicUser` lo excluye explícitamente).

**(c) Manejo seguro de credenciales:**
El `JWT_SECRET` y la `DATABASE_URL` se mantienen en variables de entorno (archivo `.env` excluido del repositorio por `.gitignore`). El token se transmite como `Authorization: Bearer` y el backend nunca lo expone más allá de la respuesta de login/registro.

**(d) Protección contra inyección SQL:**
Todas las consultas a PostgreSQL usan parámetros posicionales (`$1`, `$2`, etc.) en vez de concatenar valores del usuario directamente en el SQL. Esto aplica tanto a las rutas de autenticación como a las de reportes.

### EP 2.7: Pruebas funcionales

**(a) Pruebas en Postman:**
Se probaron 9 escenarios en Postman cubriendo el ciclo completo de autenticación, creación de reportes, control de acceso por roles y gestión administrativa. La evidencia visual con capturas de pantalla de cada prueba se encuentra en [`evidencias_postman.md`](evidencias_postman.md).

**(b) Documentación de endpoints:**
La documentación de todos los endpoints del backend (salud, autenticación y reportes), incluyendo formato de respuesta y validaciones, se encuentra en [`endpoints.md`](endpoints.md).

**(c) Evidencia de pruebas:**
Las capturas de pantalla de Postman están en la carpeta `screenshots/` (archivos `01.png` a `09.png`) y se referencian desde [`evidencias_postman.md`](evidencias_postman.md) con descripción del método, resultado esperado y resultado obtenido para cada caso.

Para la entrega final intentaré implementar un mapa dinámico con reportes reales georreferenciados, además de mejoras como subida real de archivos (las fotos de los reportes).

# Stack

**Frontend:** Ionic con React y TypeScript, empaquetado con Vite  
**Backend:** Node.js con Express

**Base de datos:** PostgreSQL

## Pasos para ejecutar el proyecto

### Prerrequisitos
- **Node.js** (v18 o superior recomendado)
- **PostgreSQL** (para la integración de la BBDD de la EP2)

### Frontend

1. Instalar las dependencias de Node:
```bash
npm install
```

2. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

El frontend quedará disponible en su navegador en `http://localhost:5173`. El comando `npm run build` se puede usar para la versión de producción.

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend queda disponible en `http://localhost:5000/api`.

El frontend usa `http://localhost:5000/api` por defecto. Si se necesita cambiar la URL del backend, definir `VITE_API_URL`.

Endpoints de prueba:

```bash
GET http://localhost:5000/api/health
GET http://localhost:5000/api/db-health
```

Para inicializar las tablas de PostgreSQL, renombrar `backend/.env.example` a `backend/.env`, editar `DATABASE_URL`, y ejecutar:

```bash
cd backend
npm run db:init
```

**Importante:** `npm run db:init` requiere que **PostgreSQL esté instalado y ejecutándose**, y que exista una base de datos accesible mediante `DATABASE_URL` (por ejemplo `postgres://postgres:postgres@localhost:5432/no_cables`). El script crea las tablas necesarias y también deja una cuenta demo para facilitar la evaluación.

**Cuenta demo de funcionario:**

- **Usuario:** `funcionario_demo`
- **Contraseña:** `Funcionario123`
- **Rol:** `funcionario`

**De nuevo, esto es solo para facilitar la evaluación... En producción no se debería incluir por motivos de seguridad.**

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
5. El sistema valida los datos y guarda el reporte en el `ReportContext` de frontend. El backend ya tiene endpoints reales para reportes, pero estas pantallas aún no reemplazan completamente el estado en memoria.
6. El usuario es redirigido a `/mis-reportes` o ve un mensaje de éxito, cerrando el ciclo de la tarea.

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
  - **Context API:** La autenticación usa `AuthContext` con JWT entregado por el backend y persistido en `localStorage`. Los reportes aún usan `ReportContext` en memoria en las pantallas principales, aunque ya existe cliente API para conectar los endpoints reales de reportes.
  - **Componentización:** Se utilizó la estructura de carpetas sugerida por el profesor en clases. Se separaron las vistas por "Features" (ej. `/features/report/`, `/features/map/`) agrupando su lógica, vista y estilos. Esto facilita encontrar, modificar y probar componentes de forma aislada a medida que el proyecto crece.

---

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

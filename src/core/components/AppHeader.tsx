import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/react';
import { personCircleOutline, logOutOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useDummyAuth } from '../auth/DummyAuth';
import './AppHeader.css';

/*
 * Links que se muestran cuando NO hay sesión activa.
 * Son las rutas públicas de la app.
 */
const publicNavItems = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Ingresar', path: '/login' },
  { label: 'Registrarse', path: '/registro' },
];

/*
 * Links que se muestran cuando un ciudadano tiene sesión activa.
 * Reemplaza "Ingresar" y "Registrarse" por las funcionalidades del ciudadano.
 */
const citizenNavItems = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Reportar', path: '/reportar' },
  { label: 'Mis reportes', path: '/mis-reportes' },
];

/*
 * Links para el rol funcionario (admin).
 * Por ahora son básicos; se extenderán con el panel de gestión en futuras entregas.
 */
const adminNavItems = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Reportar', path: '/reportar' },
  { label: 'Mis reportes', path: '/mis-reportes' },
];

export function AppHeader() {
  const location = useLocation();
  const { user, logout } = useDummyAuth();

  // Si no es ciudadano y está logeado, es admin
  const navigationItems = !user ? publicNavItems : user.role === 'ciudadano' ? citizenNavItems : adminNavItems;

  return (
    <IonHeader className="app-header">
      <IonToolbar className="app-header-toolbar">
        <IonTitle>Municipalidad de Santo Domingo</IonTitle>
        <IonButtons slot="end">
          <nav className="app-header-nav" aria-label="Navegación principal">
            {navigationItems.map((item) => (
              <IonButton
                key={item.path}
                className={location.pathname === item.path ? 'app-header-nav-link active' : 'app-header-nav-link'}
                fill="clear"
                routerLink={item.path}
              >
                {item.label}
              </IonButton>
            ))}
          </nav>

          {/* Indicador de sesión: solo visible cuando hay un usuario autenticado */}
          {user && (
            <div className="app-header-user-badge">
              <IonIcon icon={personCircleOutline} aria-hidden="true" />
              <span className="app-header-username">{user.username}</span>
              <IonButton
                className="app-header-logout"
                fill="clear"
                size="small"
                onClick={logout}
                routerLink="/inicio"
                aria-label="Cerrar sesión"
              >
                <IonIcon icon={logOutOutline} slot="icon-only" />
              </IonButton>
            </div>
          )}
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}

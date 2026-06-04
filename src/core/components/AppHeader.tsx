import { IonButton, IonButtons, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/react';
import {
  addCircleOutline,
  documentTextOutline,
  homeOutline,
  logInOutline,
  logOutOutline,
  personAddOutline,
  personCircleOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import logoMuni from '../../assets/logo_municipalidad.png';
import './AppHeader.css';

// Links que se muestran cuando NO hay sesión activa.
// Son las rutas públicas de la app.
const publicNavItems = [
  { label: 'Inicio', path: '/inicio', icon: homeOutline },
  { label: 'Ingresar', path: '/login', icon: logInOutline },
  { label: 'Registrarse', path: '/registro', icon: personAddOutline },
];

// Links que se muestran cuando un ciudadano tiene sesión activa.
// Reemplaza "Ingresar" y "Registrarse" por las funcionalidades del ciudadano.
const citizenNavItems = [
  { label: 'Inicio', path: '/inicio', icon: homeOutline },
  { label: 'Reportar', path: '/reportar', icon: addCircleOutline },
  { label: 'Mis reportes', path: '/mis-reportes', icon: documentTextOutline },
];

// Links para el rol funcionario (admin).
// Por ahora son básicos; se extenderán con el panel de gestión en futuras entregas.
const adminNavItems = [
  { label: 'Inicio', path: '/inicio', icon: homeOutline },
  { label: 'Panel Reportes', path: '/admin-reportes', icon: documentTextOutline },
];

export function AppHeader() {
  const location = useLocation();
  const { user, logout } = useAuth();

  // Si no es ciudadano y está logeado, es admin
  const navigationItems = !user ? publicNavItems : user.role === 'ciudadano' ? citizenNavItems : adminNavItems;

  return (
    <IonHeader className="app-header">
      <IonToolbar className="app-header-toolbar">
        <IonTitle>
          <div className="app-header-brand">
            <img src={logoMuni} alt="Logo" className="app-header-logo" />
            <span className="app-header-title-desktop">Municipalidad de Santo Domingo - No+Cables</span>
            <span className="app-header-title-mobile">No+Cables</span>
          </div>
        </IonTitle>
        <IonButtons slot="end">
          <nav className="app-header-nav" aria-label="Navegación principal">
            {navigationItems.map((item) => (
              <IonButton
                key={item.path}
                className={location.pathname === item.path ? 'app-header-nav-link active' : 'app-header-nav-link'}
                fill="clear"
                routerLink={item.path}
                routerDirection="root"
              >
                <IonIcon icon={item.icon} className="app-header-nav-icon" aria-hidden="true" />
                <span className="app-header-nav-label">{item.label}</span>
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

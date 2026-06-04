import { IonButton, IonFooter, IonIcon, IonToolbar } from '@ionic/react';
import { addCircleOutline, documentTextOutline, homeOutline, logInOutline, personAddOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import './AppFooter.css';

// Los mismos items de navegación que usa AppHeader,
// duplicados aquí para que el footer pueda mostrarlos
// como barra de navegación inferior en móvil.
const publicNavItems = [
  { label: 'Inicio', path: '/inicio', icon: homeOutline },
  { label: 'Ingresar', path: '/login', icon: logInOutline },
  { label: 'Registrarse', path: '/registro', icon: personAddOutline },
];

const citizenNavItems = [
  { label: 'Inicio', path: '/inicio', icon: homeOutline },
  { label: 'Reportar', path: '/reportar', icon: addCircleOutline },
  { label: 'Mis reportes', path: '/mis-reportes', icon: documentTextOutline },
];

const adminNavItems = [
  { label: 'Inicio', path: '/inicio', icon: homeOutline },
  { label: 'Panel Reportes', path: '/admin-reportes', icon: documentTextOutline },
];

export function AppFooter() {
  const location = useLocation();
  const { user } = useAuth();

  const navigationItems = !user
    ? publicNavItems
    : user.role === 'ciudadano'
      ? citizenNavItems
      : adminNavItems;

  return (
    <IonFooter className="app-footer">
      <IonToolbar className="app-footer-toolbar app-footer-mobile-nav">
        <nav className="app-footer-nav" aria-label="Navegación principal">
          {navigationItems.map((item) => (
            <IonButton
              key={item.path}
              className={
                location.pathname === item.path
                  ? 'app-footer-nav-link active'
                  : 'app-footer-nav-link'
              }
              fill="clear"
              routerLink={item.path}
              routerDirection="root"
            >
              <div className="app-footer-nav-link-inner">
                <IonIcon icon={item.icon} aria-hidden="true" />
                <span>{item.label}</span>
              </div>
            </IonButton>
          ))}
        </nav>
      </IonToolbar>
    </IonFooter>
  );
}

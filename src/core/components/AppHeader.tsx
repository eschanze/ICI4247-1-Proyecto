import { IonButton, IonButtons, IonHeader, IonTitle, IonToolbar } from '@ionic/react';
import { useLocation } from 'react-router-dom';

const navigationItems = [
  { label: 'Inicio', path: '/inicio' },
  { label: 'Ingresar', path: '/login' },
];

export function AppHeader() {
  const location = useLocation();

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
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}

import { IonFooter, IonTitle, IonToolbar } from '@ionic/react';
import './AppFooter.css';

export function AppFooter() {
  return (
    <IonFooter className="app-footer">
      <IonToolbar className="app-footer-toolbar">
        <IonTitle className="app-footer-title">
          Proyecto ICI4247-1 2026-1 - Esteban Schanze Cárdenas
        </IonTitle>
      </IonToolbar>
    </IonFooter>
  );
}

import { IonButton, IonContent, IonPage } from '@ionic/react';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export function LandingPage() {
  usePageTitle('Inicio - Programa No+Cables');

  return (
    <IonPage>
      <IonContent className="landing-content">
        <h1>Programa No+Cables</h1>
        <p>Bienvenido al portal del Programa No+Cables.</p>
        <IonButton routerLink="/login">Ir al login</IonButton>
      </IonContent>
    </IonPage>
  );
}

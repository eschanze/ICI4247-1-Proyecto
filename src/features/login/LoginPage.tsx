import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage } from '@ionic/react';
import { AppFooter } from '../../core/components/AppFooter';
import { AppHeader } from '../../core/components/AppHeader';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export function LoginPage() {
  usePageTitle('Login - Programa No+Cables');

  return (
    <IonPage>
      <AppHeader />
      <IonContent>
        <h1>Login</h1>
        <IonItem>
          <IonLabel position="stacked">Correo</IonLabel>
          <IonInput type="email" />
        </IonItem>
        <IonItem>
          <IonLabel position="stacked">Contraseña</IonLabel>
          <IonInput type="password" />
        </IonItem>
        <IonButton>Ingresar</IonButton>
      </IonContent>
      <AppFooter />
    </IonPage>
  );
}

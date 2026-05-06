import { IonButton, IonContent, IonInput, IonItem, IonLabel, IonPage } from '@ionic/react';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export function LoginPage() {
  usePageTitle('Login - Programa No+Cables');

  return (
    <IonPage>
      <IonContent className="login-content">
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
    </IonPage>
  );
}

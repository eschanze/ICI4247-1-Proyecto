import { IonButton, IonContent, IonInput, IonItem, IonPage } from '@ionic/react';
import { usePageTitle } from '../../core/hooks/usePageTitle';

export function LoginPage() {
  usePageTitle('Login - Programa No+Cables');

  return (
    <IonPage>
      <IonContent className="login-content">
        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-header">
            <p className="login-eyebrow">Programa No+Cables</p>
            <h1 id="login-title">Ingresar</h1>
          </div>

          <div className="login-fields">
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-email">
                Correo
              </label>
              <IonItem className="login-field">
                <IonInput id="login-email" type="email" autocomplete="email" />
              </IonItem>
            </div>
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-password">
                Contraseña
              </label>
              <IonItem className="login-field">
                <IonInput id="login-password" type="password" autocomplete="current-password" />
              </IonItem>
            </div>
          </div>

          <a className="login-forgot-link" href="#" onClick={(event) => event.preventDefault()}>
            Olvidé mi contraseña
          </a>

          <IonButton className="login-submit" expand="block">
            Ingresar
          </IonButton>
        </section>
      </IonContent>
    </IonPage>
  );
}

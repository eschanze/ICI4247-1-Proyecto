import { FormEvent, useEffect, useState } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonPage, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useDummyAuth } from '../../core/auth/DummyAuth';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import './LoginPage.css';

export function LoginPage() {
  usePageTitle('Login - Programa No+Cables');

  const { user, login } = useDummyAuth();
  const router = useIonRouter();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  /* Si ya está logeado, redirigir a la página principal del ciudadano. */
  useEffect(() => {
    if (user && location.pathname === '/login') {
      router.push('/reportar', 'root');
    }
  }, [router, user, location.pathname]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Completa ambos campos.');
      return;
    }

    const success = login(username.trim(), password);

    if (!success) {
      setError('Usuario o contraseña incorrectos.');
    }
    // Si el login fue exitoso, el cambio de estado en DummyAuth
    // provocará un re-render y el useEffect redirigirá.
  }

  if (user) {
    return null;
  }

  return (
    <IonPage>
      <IonContent className="login-content">
        <form className="login-card" aria-labelledby="login-title" onSubmit={handleLogin}>
          <div className="login-card-header">
            <p className="login-eyebrow">Programa No+Cables</p>
            <h1 id="login-title">Ingresar</h1>
          </div>

          <div className="login-fields">
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-username">
                Usuario
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="login-username"
                  type="text"
                  autocomplete="username"
                  value={username}
                  onIonInput={(e) => setUsername(e.detail.value ?? '')}
                />
              </IonItem>
            </div>
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="login-password">
                Contraseña
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="login-password"
                  type="password"
                  autocomplete="current-password"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value ?? '')}
                />
              </IonItem>
            </div>
          </div>

          {/* Mensaje de error: solo visible cuando hay un error de login. */}
          {error && <p className="login-error">{error}</p>}

          <a className="login-forgot-link" href="#" onClick={(event) => event.preventDefault()}>
            Olvidé mi contraseña
          </a>

          <IonButton className="login-submit" expand="block" type="submit">
            Ingresar
          </IonButton>

          {/* Credenciales demo */}
          <div className="login-demo-hint">
            <p><strong>Credenciales demo:</strong></p>
            <p>ciudadano / contra123</p>
            <p>admin / contra123</p>
          </div>

          <IonButton className="register-login-link" fill="clear" routerLink="/registro">
            Crear cuenta
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

import { FormEvent, useEffect, useState } from 'react';
import { IonButton, IonContent, IonInput, IonItem, IonPage, useIonRouter } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import './LoginPage.css';

export function LoginPage() {
  usePageTitle('Login - Programa No+Cables');

  const { user, isLoading, login } = useAuth();
  const router = useIonRouter();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Si ya está logeado, redirigir al panel correspondiente según su rol.
  useEffect(() => {
    if (user && location.pathname === '/login') {
      router.push(user.role === 'funcionario' ? '/admin-reportes' : '/mis-reportes', 'root');
    }
  }, [router, user, location.pathname]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Completa ambos campos.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ usernameOrEmail: username.trim(), password });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Usuario o contraseña incorrectos.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading || user) {
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

          <IonButton className="login-submit" expand="block" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando...' : 'Ingresar'}
          </IonButton>

          <IonButton className="register-login-link" fill="clear" routerLink="/registro">
            Crear cuenta
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

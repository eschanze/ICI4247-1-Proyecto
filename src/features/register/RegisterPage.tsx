import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonInput,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonText,
  IonPage,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import '../login/LoginPage.css';
import './RegisterPage.css';

// Idealmente se debería obtener esta información de una API
// Para la entrega parcial 1 está bien...
// Recordatorio de preguntar la profesor porqué se pide región en el registro si la webapp es para Santo Domingo.
const regionOptions = [
  {
    label: 'Región de Valparaíso',
    value: 'valparaiso',
    communes: ['Santo Domingo', 'San Antonio', 'Valparaíso', 'Viña del Mar', 'Villa Alemana', 'Quilpué'],
  },
  {
    label: 'Región Metropolitana',
    value: 'metropolitana',
    communes: ['Santiago', 'Maipú', 'Pudahuel', 'Quilicura', 'Colina', 'Lampa'],
  },
];

export function RegisterPage() {
  usePageTitle('Registro - Programa No+Cables');

  const { user, isLoading, register } = useAuth();
  const router = useIonRouter();
  const location = useLocation();
  const [presentToast] = useIonToast();

  const [username, setUsername] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCommune, setSelectedCommune] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && location.pathname === '/registro') {
      router.push(user.role === 'funcionario' ? '/admin-reportes' : '/reportar', 'root');
    }
  }, [router, user, location.pathname]);

  const communeOptions = useMemo(() => {
    return regionOptions.find((region) => region.value === selectedRegion)?.communes ?? [];
  }, [selectedRegion]);

  function handleRegionChange(region: string) {
    setSelectedRegion(region);
    setSelectedCommune('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !rut.trim() || !email.trim() || !selectedRegion || !selectedCommune || !password) {
      setError('Completa todos los campos obligatorios.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (!acceptedTerms) {
      setError('Debes aceptar los términos y condiciones.');
      return;
    }

    try {
      setIsSubmitting(true);
      await register({
        username: username.trim(),
        rut: rut.trim(),
        email: email.trim(),
        password,
      });

      presentToast({
        message: 'Cuenta creada exitosamente.',
        duration: 2500,
        position: 'top',
        color: 'success',
      });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'No se pudo crear la cuenta.');
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
        <form className="login-card register-card" aria-labelledby="register-title" onSubmit={handleSubmit}>
          <div className="login-card-header">
            <p className="login-eyebrow">Programa No+Cables</p>
            <h1 id="register-title">Registro</h1>
          </div>

          <div className="login-fields register-fields">
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-username">
                Nombre de usuario
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="register-username"
                  name="username"
                  type="text"
                  autocomplete="nickname"
                  value={username}
                  onIonInput={(event) => setUsername(event.detail.value ?? '')}
                />
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-rut">
                RUT
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="register-rut"
                  name="rut"
                  type="text"
                  inputMode="text"
                  autocomplete="off"
                  placeholder="12.345.678-5"
                  value={rut}
                  onIonInput={(event) => setRut(event.detail.value ?? '')}
                />
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-email">
                Correo Electrónico
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="register-email"
                  type="email"
                  autocomplete="email"
                  value={email}
                  onIonInput={(event) => setEmail(event.detail.value ?? '')}
                />
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-region">
                Región
              </label>
              <IonItem className="login-field">
                <IonSelect
                  id="register-region"
                  interface="popover"
                  placeholder="Selecciona una región"
                  value={selectedRegion}
                  onIonChange={(event) => handleRegionChange(event.detail.value)}
                >
                  {regionOptions.map((region) => (
                    <IonSelectOption key={region.value} value={region.value}>
                      {region.label}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-commune">
                Comuna
              </label>
              <IonItem className="login-field">
                <IonSelect
                  id="register-commune"
                  disabled={!selectedRegion}
                  interface="popover"
                  placeholder={selectedRegion ? 'Selecciona una comuna' : 'Selecciona una región primero'}
                  value={selectedCommune}
                  onIonChange={(event) => setSelectedCommune(event.detail.value)}
                >
                  {communeOptions.map((commune) => (
                    <IonSelectOption key={commune} value={commune}>
                      {commune}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-password">
                Contraseña
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="register-password"
                  type="password"
                  autocomplete="new-password"
                  value={password}
                  onIonInput={(event) => setPassword(event.detail.value ?? '')}
                />
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-password-confirmation">
                Confirmación de Contraseña
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="register-password-confirmation"
                  type="password"
                  autocomplete="new-password"
                  value={passwordConfirmation}
                  onIonInput={(event) => setPasswordConfirmation(event.detail.value ?? '')}
                />
              </IonItem>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <IonItem className="register-terms" lines="none">
            <IonCheckbox
              checked={acceptedTerms}
              id="register-terms"
              slot="start"
              onIonChange={(event) => setAcceptedTerms(event.detail.checked)}
            />
            <IonText>
              <label htmlFor="register-terms">Acepto los términos y condiciones</label>
            </IonText>
          </IonItem>

          <IonButton className="login-submit" expand="block" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
          </IonButton>

          <IonButton className="register-login-link" fill="clear" routerLink="/login">
            Ya tengo una cuenta
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}

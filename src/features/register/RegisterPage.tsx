import { useMemo, useState } from 'react';
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
} from '@ionic/react';
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
  const [selectedRegion, setSelectedRegion] = useState('');

  usePageTitle('Registro - Programa No+Cables');

  const communeOptions = useMemo(() => {
    return regionOptions.find((region) => region.value === selectedRegion)?.communes ?? [];
  }, [selectedRegion]);

  return (
    <IonPage>
      <IonContent className="login-content">
        <section className="login-card register-card" aria-labelledby="register-title">
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
                <IonInput id="register-username" name="username" type="text" autocomplete="nickname" />
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
                  placeholder="12.345.678-9"
                />
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-email">
                Correo Electrónico
              </label>
              <IonItem className="login-field">
                <IonInput id="register-email" type="email" autocomplete="email" />
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
                  onIonChange={(event) => setSelectedRegion(event.detail.value)}
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
                <IonInput id="register-password" type="password" autocomplete="new-password" />
              </IonItem>
            </div>

            <div className="login-field-group">
              <label className="login-field-label" htmlFor="register-password-confirmation">
                Confirmación de Contraseña
              </label>
              <IonItem className="login-field">
                <IonInput id="register-password-confirmation" type="password" autocomplete="new-password" />
              </IonItem>
            </div>
          </div>

          <IonItem className="register-terms" lines="none">
            <IonCheckbox id="register-terms" slot="start" />
            <IonText>
              <label htmlFor="register-terms">Acepto los términos y condiciones</label>
            </IonText>
          </IonItem>

          <IonButton className="login-submit" expand="block">
            Crear cuenta
          </IonButton>

          <IonButton className="register-login-link" fill="clear" routerLink="/login">
            Ya tengo una cuenta
          </IonButton>
        </section>
      </IonContent>
    </IonPage>
  );
}

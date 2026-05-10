/*
 * ReportPage.tsx – RF1: Registro de incidente por ciudadano.
 *
 * Formulario que permite a un ciudadano autenticado crear un reporte
 * de cables en desuso indicando dirección, descripción, urgencia y una foto opcional.
 *
 * Si el usuario no tiene sesión activa, se le redirige a /login.
 */

import { useEffect, useRef, useState } from 'react';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonItem,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  useIonRouter,
  useIonToast,
} from '@ionic/react';
import { cameraOutline, closeCircleOutline } from 'ionicons/icons';
import { useDummyAuth } from '../../core/auth/DummyAuth';
import { useReports } from '../../core/data/ReportContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import type { UrgencyLevel } from '../../core/data/ReportContext';
import './ReportPage.css';

export function ReportPage() {
  usePageTitle('Reportar incidente - Programa No+Cables');

  const { user } = useDummyAuth();
  const { addReport } = useReports();

  /*
   * useIonRouter() da acceso al router de Ionic para navegación programática.
   * A diferencia de routerLink (que va en el JSX), push() permite navegar
   * después de ejecutar lógica (ej: validar formulario, guardar datos).
   */
  const router = useIonRouter();

  /*
   * useIonToast() retorna un array con [present, dismiss].
   * present() muestra un toast temporal en pantalla.
   */
  const [presentToast] = useIonToast();

  const [street, setStreet] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('media');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ street?: string; description?: string }>({});

  /*
   * useRef crea una referencia mutable que persiste entre renders sin causar re-renders.
   * Aquí la usamos para acceder al <input type="file"> nativo del DOM,
   * ya que Ionic no tiene un componente propio para selección de archivos.
   */
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login', 'root');
    }
  }, [router, user]);

  if (!user) {
    return null;
  }

  /*
   * Capturamos el username en una constante después del guard clause.
   * TypeScript no puede garantizar que `user` siga siendo no-null dentro de closures
   * (como handleSubmit), pero sí puede rastrear una const local que se asigna tras el if.
   */
  const currentUsername = user.username;

  /*
   * Maneja la selección de un archivo de imagen.
   * FileReader convierte el archivo a un Data URL (string base64)
   * que se puede mostrar directamente en un <img> y almacenar en el estado.
   */
  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  /* Elimina la foto seleccionada y resetea el input de archivos. */
  function removePhoto() {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  /* Valida y envía el formulario. */
  function handleSubmit() {
    // Validación: dirección y descripción son obligatorias.
    const newErrors: { street?: string; description?: string } = {};

    if (!street.trim()) {
      newErrors.street = 'La dirección es obligatoria.';
    }
    if (!description.trim()) {
      newErrors.description = 'La descripción es obligatoria.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    addReport(
      {
        street: street.trim(),
        description: description.trim(),
        urgency,
        photoDataUrl: photoPreview,
      },
      currentUsername,
    );

    presentToast({
      message: '¡Reporte creado exitosamente!',
      duration: 2500,
      position: 'top',
      color: 'success',
    });

    router.push('/mis-reportes', 'forward');
  }

  return (
    <IonPage>
      <IonContent className="login-content">
        <section className="login-card report-card" aria-labelledby="report-title">
          <div className="login-card-header">
            <p className="login-eyebrow">Programa No+Cables</p>
            <h1 id="report-title">Reportar incidente</h1>
          </div>

          <div className="login-fields report-fields">
            {/* Dirección */}
            <div className="login-field-group report-field-full">
              <label className="login-field-label" htmlFor="report-street">
                Dirección (calle y número)
              </label>
              <IonItem className="login-field">
                <IonInput
                  id="report-street"
                  type="text"
                  placeholder="Ej: Av. Libertad 1234"
                  value={street}
                  onIonInput={(e) => setStreet(e.detail.value ?? '')}
                />
              </IonItem>
              {errors.street && <p className="report-error">{errors.street}</p>}
            </div>

            {/* Descripción */}
            <div className="login-field-group report-field-full">
              <label className="login-field-label" htmlFor="report-description">
                Descripción del problema
              </label>
              <IonItem className="login-field report-textarea-item">
                <IonTextarea
                  id="report-description"
                  rows={4}
                  placeholder="Describe el estado de los cables, riesgos observados, etc."
                  value={description}
                  onIonInput={(e) => setDescription(e.detail.value ?? '')}
                />
              </IonItem>
              {errors.description && <p className="report-error">{errors.description}</p>}
            </div>

            {/* Urgencia */}
            <div className="login-field-group">
              <label className="login-field-label" htmlFor="report-urgency">
                Nivel de urgencia percibido
              </label>
              <IonItem className="login-field report-urgency-field">
                <IonSelect
                  className="report-urgency-select"
                  id="report-urgency"
                  interface="popover"
                  value={urgency}
                  onIonChange={(e) => setUrgency(e.detail.value)}
                >
                  <IonSelectOption value="baja">Baja</IonSelectOption>
                  <IonSelectOption value="media">Media</IonSelectOption>
                  <IonSelectOption value="alta">Alta</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            {/* Foto adjunta */}
            <div className="login-field-group report-photo-field">
              <span className="login-field-label">Foto adjunta (opcional)</span>

              {/*
                El input nativo está oculto visualmente (display:none).
                Al hacer clic en el IonButton, se dispara el click del input
                via la referencia (fileInputRef.current.click()).
              */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="report-file-input-hidden"
                onChange={handlePhotoChange}
              />

              {!photoPreview ? (
                <IonButton
                  className="report-upload-button"
                  fill="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IonIcon icon={cameraOutline} slot="start" />
                  Seleccionar foto
                </IonButton>
              ) : (
                <div className="report-photo-preview">
                  <img src={photoPreview} alt="Vista previa de la foto adjunta" />
                  <IonButton
                    className="report-photo-remove"
                    fill="clear"
                    size="small"
                    onClick={removePhoto}
                    aria-label="Eliminar foto"
                  >
                    <IonIcon icon={closeCircleOutline} slot="icon-only" />
                  </IonButton>
                </div>
              )}
            </div>
          </div>

          <IonButton className="login-submit" expand="block" onClick={handleSubmit}>
            Enviar reporte
          </IonButton>
        </section>
      </IonContent>
    </IonPage>
  );
}

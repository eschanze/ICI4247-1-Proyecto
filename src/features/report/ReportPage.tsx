/*
 * ReportPage.tsx – RF1: Registro de incidente por ciudadano.
 *
 * Formulario que permite a un ciudadano autenticado crear un reporte
 * de cables en desuso indicando dirección, descripción, urgencia y una foto opcional.
 *
 * Si el usuario no tiene sesión activa, se le redirige a /login.
 */

import { type ChangeEvent, type DragEvent, type KeyboardEvent, useEffect, useRef, useState } from 'react';
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
import { cameraOutline, closeCircleOutline, cloudUploadOutline } from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { createReport } from '../../core/api/reportsApi';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import type { UrgencyLevel } from '../../core/data/ReportContext';
import '../login/LoginPage.css';
import './ReportPage.css';

export function ReportPage() {
  usePageTitle('Reportar incidente - Programa No+Cables');

  const { user, isLoading, token } = useAuth();

  const router = useIonRouter();
  const location = useLocation();

  const [presentToast] = useIonToast();

  const [street, setStreet] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<UrgencyLevel>('media');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ street?: string; description?: string }>({});
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading || location.pathname !== '/reportar') {
      return;
    }

    if (!user) {
      router.push('/login', 'root');
    } else if (user.role === 'funcionario') {
      router.push('/admin-reportes', 'root');
    }
  }, [router, user, isLoading, location.pathname]);

  if (isLoading || !user || user.role === 'funcionario') {
    return null;
  }

  function previewPhotoFile(file: File) {
    if (!file.type.startsWith('image/')) {
      presentToast({
        message: 'El archivo seleccionado debe ser una imagen.',
        duration: 2500,
        position: 'top',
        color: 'warning',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    previewPhotoFile(file);
  }

  function handlePhotoDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingPhoto(true);
  }

  function handlePhotoDragLeave(event: DragEvent<HTMLLabelElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDraggingPhoto(false);
    }
  }

  function handlePhotoDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDraggingPhoto(false);

    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    previewPhotoFile(file);
  }

  function handlePhotoKeyDown(event: KeyboardEvent<HTMLLabelElement>) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      fileInputRef.current?.click();
    }
  }

  // Eliminamos la foto seleccionada y reseteamos el input de archivos
  function removePhoto() {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  // Validamos y enviamos el formulario al backend
  async function handleSubmit() {
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
    setIsSubmitting(true);

    try {
      await createReport(token!, {
        street: street.trim(),
        description: description.trim(),
        urgency,
        photoUrl: photoPreview,
      });

      presentToast({
        message: '¡Reporte creado exitosamente!',
        duration: 2500,
        position: 'top',
        color: 'success',
      });

      router.push('/mis-reportes', 'forward');
    } catch {
      presentToast({
        message: 'No se pudo crear el reporte. Intenta nuevamente.',
        duration: 3000,
        position: 'top',
        color: 'danger',
      });
    } finally {
      setIsSubmitting(false);
    }
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
            <div className="login-field-group report-field-full report-street-field">
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
            <div className="login-field-group report-urgency-group">
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

              <input
                id="report-photo-input"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="report-file-input-hidden"
                onChange={handlePhotoChange}
              />

              {!photoPreview ? (
                <label
                  className={`report-upload-zone${isDraggingPhoto ? ' report-upload-zone-active' : ''}`}
                  htmlFor="report-photo-input"
                  role="button"
                  tabIndex={0}
                  onDragOver={handlePhotoDragOver}
                  onDragLeave={handlePhotoDragLeave}
                  onDrop={handlePhotoDrop}
                  onKeyDown={handlePhotoKeyDown}
                >
                  <IonIcon className="report-upload-icon" icon={cloudUploadOutline} aria-hidden="true" />
                  <span className="report-upload-button">
                    <IonIcon icon={cameraOutline} aria-hidden="true" />
                    Agregar archivos
                  </span>
                  <span className="report-upload-copy">
                    Arrastra una foto aquí o selecciona un archivo
                  </span>
                </label>
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

          <IonButton className="login-submit" expand="block" onClick={handleSubmit} disabled={isSubmitting}>
            Enviar reporte
          </IonButton>
        </section>
      </IonContent>
    </IonPage>
  );
}

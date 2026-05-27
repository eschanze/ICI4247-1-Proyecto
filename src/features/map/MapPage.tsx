import { IonContent, IonPage } from '@ionic/react';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import './MapPage.css';

/*
 * MapPage.tsx – RF2: Visualización de reportes en mapa interactivo.
 *
 * Boilerplate para la EP1.
 * Mapa estático que se reemplazará por una integración con Google Maps API en futuras entregas.
 */
export function MapPage() {
  usePageTitle('Mapa de reportes - Programa No+Cables');

  return (
    <IonPage>
      <IonContent className="map-content" scrollY={false}>
        <div className="map-container">
          <iframe
            title="Mapa de Santo Domingo"
            src="https://maps.google.com/maps?q=Santo%20Domingo,%20Chile&t=&z=13&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </IonContent>
    </IonPage>
  );
}

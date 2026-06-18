import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { useEffect, useMemo, useState } from 'react';
import { IonBadge, IonContent, IonPage, IonSpinner, useIonToast } from '@ionic/react';
import { getMapReports } from '../../../core/api/reportsApi';
import type { ApiMapReport } from '../../../core/api/reportsApi';
import { usePageTitle } from '../../../core/hooks/usePageTitle';
import type { ReportStatus } from '../../../core/data/ReportContext';
import './MapPage.css';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'medium' },
  verificado: { label: 'Verificado', color: 'primary' },
  agendado: { label: 'Agendado', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'tertiary' },
  resuelto: { label: 'Resuelto', color: 'success' },
};

// Nota: Necesitamos calcular dinámicamente dónde centrar la cámara del mapa.
// Como no todos los reportes están exactamente juntos, promediamos las latitudes 
// y longitudes extremas de la lista de reportes cargada para que la cámara 
// abarque el área donde están ubicados.
function getMapCenter(reports: ApiMapReport[]) {
  if (reports.length === 0) {
    return { lat: -33.647047, lng: -71.622541 }; // Centro por defecto (Santo Domingo)
  }

  const latitudes = reports.map((report) => report.latitude);
  const longitudes = reports.map((report) => report.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  return {
    lat: (minLat + maxLat) / 2,
    lng: (minLng + maxLng) / 2,
  };
}

export function MapPage() {
  usePageTitle('Mapa de reportes - Programa No+Cables');

  const [reports, setReports] = useState<ApiMapReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [presentToast] = useIonToast();

  // Cargamos el SDK de Google Maps de forma asíncrona.
  // Es crítico que la API key esté en el .env (como VITE_GOOGLE_MAPS_API_KEY) 
  // para que esto funcione sin revelar nuestras claves en el código fuente de GitHub.
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  });

  useEffect(() => {
    getMapReports()
      .then((res) => {
        setReports(res.reports);
        setSelectedReportId(res.reports[0]?.id ?? null);
      })
      .catch(() =>
        presentToast({
          message: 'No se pudieron cargar los reportes del mapa.',
          duration: 3000,
          position: 'top',
          color: 'danger',
        }),
      )
      .finally(() => setIsLoadingReports(false));
  }, []);

  const mapCenter = useMemo(() => getMapCenter(reports), [reports]);
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  return (
    <IonPage>
      <IonContent className="map-content" scrollY={false}>
        <div className="map-layout">
          <section className="map-canvas" aria-label="Mapa de reportes georreferenciados">
            {isLoadingReports || !isMapLoaded ? (
              <div className="map-loading">
                <IonSpinner name="crescent" />
                <span>Cargando mapa...</span>
              </div>
            ) : reports.length > 0 ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={mapCenter}
                zoom={14}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                }}
              >
                {reports.map((report) => {
                  const isSelected = report.id === selectedReport?.id;

                  return (
                    <MarkerF
                      key={report.id}
                      position={{ lat: report.latitude, lng: report.longitude }}
                      onClick={() => setSelectedReportId(report.id)}
                      title={report.street}
                      animation={isSelected ? google.maps.Animation.BOUNCE : undefined}
                    />
                  );
                })}
              </GoogleMap>
            ) : (
              <div className="map-empty">
                <h2>Sin reportes geocodificados</h2>
                <p>Los nuevos reportes aparecerán aquí cuando Google Geocoding entregue coordenadas.</p>
              </div>
            )}
          </section>

          <aside className="map-sidebar" aria-label="Detalle de reporte seleccionado">
            <div>
              <p className="login-eyebrow">Mapa dinámico</p>
              <h1>Reportes georreferenciados</h1>
            </div>

            {selectedReport ? (
              <div className="map-selected-report">
                <h2>{selectedReport.street}</h2>
                <div className="map-report-badges">
                  <IonBadge color={STATUS_CONFIG[selectedReport.status].color}>
                    {STATUS_CONFIG[selectedReport.status].label}
                  </IonBadge>
                  <IonBadge color={selectedReport.urgency === 'alta' ? 'danger' : selectedReport.urgency === 'media' ? 'warning' : 'success'}>
                    Urgencia: {selectedReport.urgency}
                  </IonBadge>
                </div>
                <p>
                  Coordenadas: {selectedReport.latitude.toFixed(5)}, {selectedReport.longitude.toFixed(5)}
                </p>
              </div>
            ) : (
              <p className="map-sidebar-empty">No hay reportes con coordenadas para mostrar.</p>
            )}

            {reports.length > 0 && (
              <div className="map-report-list">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    className={report.id === selectedReport?.id ? 'active' : ''}
                    onClick={() => setSelectedReportId(report.id)}
                  >
                    <span>{report.street}</span>
                    <small>{STATUS_CONFIG[report.status].label}</small>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>
      </IonContent>
    </IonPage>
  );
}

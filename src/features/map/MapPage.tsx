import { useEffect, useMemo, useState } from 'react';
import { IonBadge, IonContent, IonIcon, IonPage, IonSpinner, useIonToast } from '@ionic/react';
import { locationOutline } from 'ionicons/icons';
import { getMapReports } from '../../core/api/reportsApi';
import type { ApiMapReport } from '../../core/api/reportsApi';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import type { ReportStatus } from '../../core/data/ReportContext';
import './MapPage.css';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'medium' },
  verificado: { label: 'Verificado', color: 'primary' },
  agendado: { label: 'Agendado', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'tertiary' },
  resuelto: { label: 'Resuelto', color: 'success' },
};

function getMapBounds(reports: ApiMapReport[]) {
  if (reports.length === 0) {
    return {
      minLat: -33.66,
      maxLat: -33.58,
      minLng: -71.66,
      maxLng: -71.55,
    };
  }

  const latitudes = reports.map((report) => report.latitude);
  const longitudes = reports.map((report) => report.longitude);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latPadding = Math.max((maxLat - minLat) * 0.18, 0.01);
  const lngPadding = Math.max((maxLng - minLng) * 0.18, 0.01);

  return {
    minLat: minLat - latPadding,
    maxLat: maxLat + latPadding,
    minLng: minLng - lngPadding,
    maxLng: maxLng + lngPadding,
  };
}

function getMarkerPosition(report: ApiMapReport, bounds: ReturnType<typeof getMapBounds>) {
  const left = ((report.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
  const top = ((bounds.maxLat - report.latitude) / (bounds.maxLat - bounds.minLat)) * 100;

  return {
    left: `${Math.min(Math.max(left, 4), 96)}%`,
    top: `${Math.min(Math.max(top, 6), 94)}%`,
  };
}

export function MapPage() {
  usePageTitle('Mapa de reportes - Programa No+Cables');

  const [reports, setReports] = useState<ApiMapReport[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [presentToast] = useIonToast();

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

  const bounds = useMemo(() => getMapBounds(reports), [reports]);
  const selectedReport = reports.find((report) => report.id === selectedReportId) ?? reports[0] ?? null;

  return (
    <IonPage>
      <IonContent className="map-content" scrollY={false}>
        <div className="map-layout">
          <section className="map-canvas" aria-label="Mapa de reportes georreferenciados">
            <div className="map-grid" aria-hidden="true" />

            {isLoadingReports ? (
              <div className="map-loading">
                <IonSpinner name="crescent" />
                <span>Cargando reportes...</span>
              </div>
            ) : reports.length > 0 ? (
              reports.map((report) => {
                const statusConfig = STATUS_CONFIG[report.status];
                const markerPosition = getMarkerPosition(report, bounds);
                const isSelected = report.id === selectedReport?.id;

                return (
                  <button
                    key={report.id}
                    className={`map-marker ${isSelected ? 'selected' : ''}`}
                    style={markerPosition}
                    onClick={() => setSelectedReportId(report.id)}
                    aria-label={`Reporte en ${report.street}`}
                    title={`${report.street} - ${statusConfig.label}`}
                  >
                    <IonIcon icon={locationOutline} aria-hidden="true" />
                  </button>
                );
              })
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

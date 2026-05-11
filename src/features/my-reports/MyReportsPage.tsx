/*
 * MyReportsPage.tsx – RF5: Seguimiento del estado de reportes por el ciudadano.
 *
 * Muestra una lista de todos los reportes creados por el usuario actual,
 * con su estado, urgencia, y la posibilidad de expandir cada uno para ver
 * el detalle completo (descripción, foto, historial de estados, fecha programada).
 *
 * Si el usuario no tiene sesión activa, se le redirige a /login.
 */

import { useEffect, useState } from 'react';
import { IonBadge,IonButton,IonContent,IonIcon,IonPage,useIonRouter } from '@ionic/react';
import {
  addCircleOutline,
  alertCircleOutline,
  calendarOutline,
  chevronDownOutline,
  chevronUpOutline,
  timeOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useDummyAuth } from '../../core/auth/DummyAuth';
import { useReports } from '../../core/data/ReportContext';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import type { Report, ReportStatus } from '../../core/data/ReportContext';
import './MyReportsPage.css';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'medium' },
  verificado: { label: 'Verificado', color: 'primary' },
  agendado: { label: 'Agendado', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'tertiary' },
  resuelto: { label: 'Resuelto', color: 'success' },
};

/* Mapea nivel de urgencia a un color Ionic para los badges. */
const URGENCY_COLORS: Record<string, string> = {
  baja: 'success',
  media: 'warning',
  alta: 'danger',
};

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/* Variante corta de formato de fecha para el historial. */
function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ReportCard muestra un reporte individual con opción de expandir/colapsar. */
function ReportCard({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false);

  const statusConfig = STATUS_CONFIG[report.status];
  const urgencyColor = URGENCY_COLORS[report.urgency] ?? 'medium';

  return (
    <article className="my-report-card">
      {/* Cabecera: siempre visible */}
      <button
        className="my-report-card-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={`report-detail-${report.id}`}
      >
        <div className="my-report-card-main">
          <h2 className="my-report-card-street">{report.street}</h2>
          <p className="my-report-card-date">
            <IonIcon icon={timeOutline} aria-hidden="true" />
            {formatDate(report.createdAt)}
          </p>
        </div>

        <div className="my-report-card-badges">
          <IonBadge color={statusConfig.color}>{statusConfig.label}</IonBadge>
          <IonBadge color={urgencyColor}>Urgencia: {report.urgency}</IonBadge>
        </div>

        <IonIcon
          className="my-report-card-chevron"
          icon={expanded ? chevronUpOutline : chevronDownOutline}
          aria-hidden="true"
        />
      </button>

      {/* Detalle: visible solo cuando está expandido */}
      {expanded && (
        <div className="my-report-card-detail" id={`report-detail-${report.id}`}>
          {/* Descripción */}
          <div className="my-report-detail-section">
            <h3>Descripción</h3>
            <p>{report.description}</p>
          </div>

          {/* Foto adjunta, si existe */}
          {report.photoDataUrl && (
            <div className="my-report-detail-section">
              <h3>Foto adjunta</h3>
              <div className="my-report-detail-photo">
                <img src={report.photoDataUrl} alt="Foto del incidente reportado" />
              </div>
            </div>
          )}

          {/* Fecha programada de intervención */}
          {report.scheduledDate && (
            <div className="my-report-detail-scheduled">
              <IonIcon icon={calendarOutline} aria-hidden="true" />
              <span>
                <strong>Fecha programada de retiro:</strong> {formatDate(report.scheduledDate)}
              </span>
            </div>
          )}

          {/* Historial de cambios de estado */}
          <div className="my-report-detail-section">
            <h3>Historial de estados</h3>
            <ol className="my-report-timeline">
              {report.statusHistory.map((entry, index) => (
                <li
                  key={index}
                  className={`my-report-timeline-entry ${index === report.statusHistory.length - 1 ? 'current' : ''}`}
                >
                  <div className="my-report-timeline-dot" />
                  <div className="my-report-timeline-content">
                    <strong>{STATUS_CONFIG[entry.status].label}</strong>
                    <span className="my-report-timeline-date">{formatShortDate(entry.date)}</span>
                    {entry.comment && (
                      <p className="my-report-timeline-comment">{entry.comment}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </article>
  );
}

export function MyReportsPage() {
  usePageTitle('Mis reportes - Programa No+Cables');

  const { user } = useDummyAuth();
  const { getReportsByUser } = useReports();
  const router = useIonRouter();
  const location = useLocation();

  /* Redirigir si no hay sesión */
  useEffect(() => {
    if (!user && location.pathname === '/mis-reportes') {
      router.push('/login', 'root');
    }
  }, [router, user, location.pathname]);

  if (!user) {
    return null;
  }

  const userReports = getReportsByUser(user.username).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <IonPage>
      <IonContent className="login-content">
        <div className="my-reports-container">
          {/* Encabezado de la página */}
          <div className="my-reports-header">
            <div>
              <p className="login-eyebrow">Programa No+Cables</p>
              <h1>Mis reportes</h1>
            </div>
            <IonButton routerLink="/reportar">
              <IonIcon icon={addCircleOutline} slot="start" />
              Nuevo reporte
            </IonButton>
          </div>

          {/* Lista de reportes o empty state */}
          {userReports.length > 0 ? (
            <div className="my-reports-list">
              {userReports.map((report) => (
                <ReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <section className="my-reports-empty" aria-label="Sin reportes">
              <IonIcon icon={alertCircleOutline} aria-hidden="true" />
              <h2>No tienes reportes aún</h2>
              <p>Crea tu primer reporte de cables en desuso para comenzar.</p>
              <IonButton routerLink="/reportar">
                <IonIcon icon={addCircleOutline} slot="start" />
                Crear mi primer reporte
              </IonButton>
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

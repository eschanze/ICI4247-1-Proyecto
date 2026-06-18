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
import { IonBadge, IonButton, IonContent, IonIcon, IonPage, useIonRouter, useIonToast } from '@ionic/react';
import {
  addCircleOutline,
  alertCircleOutline,
  calendarOutline,
  chevronDownOutline,
  chevronUpOutline,
  timeOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../core/auth/AuthContext';
import { getMyReports } from '../../core/api/reportsApi';
import type { ApiPagination, ApiReport } from '../../core/api/reportsApi';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import type { ReportStatus } from '../../core/data/ReportContext';
import './MyReportsPage.css';

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'medium' },
  verificado: { label: 'Verificado', color: 'primary' },
  agendado: { label: 'Agendado', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'tertiary' },
  resuelto: { label: 'Resuelto', color: 'success' },
};

// Mapeamos nivel de urgencia a un color Ionic para los badges
const URGENCY_COLORS: Record<string, string> = {
  baja: 'success',
  media: 'warning',
  alta: 'danger',
};
const PAGE_SIZE = 10;

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Variante corta de formato de fecha para el historial
function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ReportCard muestra un reporte individual con opción de expandir/colapsar
function ReportCard({ report }: { report: ApiReport }) {
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
          {report.photoUrl && (
            <div className="my-report-detail-section">
              <h3>Foto adjunta</h3>
              <div className="my-report-detail-photo">
                <img src={report.photoUrl} alt="Foto del incidente reportado" />
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

  const { user, isLoading, token } = useAuth();
  const [presentToast] = useIonToast();
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const router = useIonRouter();
  const location = useLocation();

  // Redirigir si no hay sesión o es funcionario
  useEffect(() => {
    if (isLoading || location.pathname !== '/mis-reportes') {
      return;
    }

    if (!user) {
      router.push('/login', 'root');
    } else if (user.role === 'funcionario') {
      router.push('/admin-reportes', 'root');
    }
  }, [router, user, isLoading, location.pathname]);

  // Cargamos los reportes del ciudadano cuando la sesión está lista
  useEffect(() => {
    if (isLoading || !token || !user || user.role === 'funcionario') return;

    setIsLoadingReports(true);
    getMyReports(token, page, PAGE_SIZE)
      .then((res) => {
        setReports(res.reports);
        setPagination(res.pagination);
      })
      .catch(() =>
        presentToast({
          message: 'No se pudieron cargar tus reportes.',
          duration: 3000,
          position: 'top',
          color: 'danger',
        }),
      )
      .finally(() => setIsLoadingReports(false));
  }, [token, isLoading, page]);

  if (isLoading || !user || user.role === 'funcionario') {
    return null;
  }

  const userReports = [...reports].sort(
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
          {isLoadingReports ? (
            <section className="my-reports-empty" aria-label="Cargando">
              <p>Cargando reportes...</p>
            </section>
          ) : userReports.length > 0 ? (
            <>
              <div className="my-reports-list">
                {userReports.map((report) => (
                  <ReportCard key={report.id} report={report} />
                ))}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="my-reports-pagination">
                  <IonButton fill="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                    Anterior
                  </IonButton>
                  <span>
                    Página {pagination.page} de {pagination.totalPages}
                  </span>
                  <IonButton fill="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((current) => current + 1)}>
                    Siguiente
                  </IonButton>
                </div>
              )}
            </>
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

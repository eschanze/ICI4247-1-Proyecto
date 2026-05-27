/*
 * AdminReportsPage.tsx – RF3: Gestión y triage de reportes por el funcionario.
 *
 * Panel que permite al funcionario ver todos los reportes del sistema,
 * cambiar su estado y nivel de urgencia, y revisar el historial de cada caso.
 *
 * Si el usuario no tiene sesión activa o no es funcionario, se le redirige a /inicio.
 */

import { useEffect, useState } from 'react';
import { IonBadge, IonContent, IonIcon, IonPage, useIonRouter, IonSelect, IonSelectOption, IonItem, IonLabel } from '@ionic/react';
import {
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
import type { Report, ReportStatus, UrgencyLevel } from '../../core/data/ReportContext';
import '../my-reports/MyReportsPage.css'; // Reutilizamos los estilos de "Mis Reportes"

// Configuración de etiquetas y colores para cada estado de reporte.
const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'medium' },
  verificado: { label: 'Verificado', color: 'primary' },
  agendado: { label: 'Agendado', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'tertiary' },
  resuelto: { label: 'Resuelto', color: 'success' },
};

// Mapea nivel de urgencia a un color Ionic para los badges.
const URGENCY_COLORS: Record<string, string> = {
  baja: 'success',
  media: 'warning',
  alta: 'danger',
};

// Función helper para mostrar fechas en formato largo. 
// Ej: "28 de abril de 2026".
function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Función helper para mostrar fechas en formato corto dentro del historial de estados. 
// Ej: "28 Abr 2026, 10:15".
function formatShortDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// AdminReportCard muestra un reporte individual (con la opción de modificar estado y urgencia)
function AdminReportCard({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false);
  const { updateReport } = useReports();

  const statusConfig = STATUS_CONFIG[report.status];
  const urgencyColor = URGENCY_COLORS[report.urgency] ?? 'medium';

  const handleStatusChange = (newStatus: ReportStatus) => {
    updateReport(report.id, { status: newStatus }, 'Cambio de estado por administrador');
  };

  const handleUrgencyChange = (newUrgency: UrgencyLevel) => {
    updateReport(report.id, { urgency: newUrgency });
  };

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
            {formatDate(report.createdAt)} - Autor: {report.authorUsername}
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
          {/* Controles de Administrador (RF3) */}
          <div className="my-report-detail-section" style={{ backgroundColor: 'var(--app-paper)', padding: '16px', border: 'var(--app-border-width) solid var(--app-ink)' }}>
            <h3>Gestión del Reporte (Admin)</h3>
            
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonLabel>Estado:</IonLabel>
              <IonSelect 
                value={report.status} 
                onIonChange={e => handleStatusChange(e.detail.value)}
                interface="popover"
              >
                <IonSelectOption value="pendiente">Pendiente</IonSelectOption>
                <IonSelectOption value="verificado">Verificado</IonSelectOption>
                <IonSelectOption value="agendado">Agendado</IonSelectOption>
                <IonSelectOption value="en_proceso">En proceso</IonSelectOption>
                <IonSelectOption value="resuelto">Resuelto</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonLabel>Urgencia:</IonLabel>
              <IonSelect 
                value={report.urgency} 
                onIonChange={e => handleUrgencyChange(e.detail.value)}
                interface="popover"
              >
                <IonSelectOption value="baja">Baja</IonSelectOption>
                <IonSelectOption value="media">Media</IonSelectOption>
                <IonSelectOption value="alta">Alta</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>

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

// Página principal de administración de reportes, accesible solo para funcionarios (RF3).
export function AdminReportsPage() {
  usePageTitle('Administración de Reportes - Programa No+Cables');

  const { user } = useDummyAuth();
  const { reports } = useReports();
  const router = useIonRouter();
  const location = useLocation();

  // Redirigir si no hay sesión o no es admin
  useEffect(() => {
    if ((!user || user.role !== 'funcionario') && location.pathname === '/admin-reportes') {
      router.push('/inicio', 'root');
    }
  }, [router, user, location.pathname]);

  if (!user || user.role !== 'funcionario') {
    return null;
  }

  // Ordenar reportes más recientes primero
  const allReports = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <IonPage>
      <IonContent className="login-content">
        <div className="my-reports-container">
          {/* Encabezado de la página */}
          <div className="my-reports-header">
            <div>
              <p className="login-eyebrow">Panel de Funcionario</p>
              <h1>Panel Reportes</h1>
            </div>
          </div>

          {/* Lista de reportes o empty state */}
          {allReports.length > 0 ? (
            <div className="my-reports-list">
              {allReports.map((report) => (
                <AdminReportCard key={report.id} report={report} />
              ))}
            </div>
          ) : (
            <section className="my-reports-empty" aria-label="Sin reportes">
              <IonIcon icon={alertCircleOutline} aria-hidden="true" />
              <h2>No hay reportes en el sistema</h2>
              <p>Actualmente no se han ingresado reportes por los ciudadanos.</p>
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

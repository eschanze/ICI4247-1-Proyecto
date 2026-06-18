/*
 * AdminReportsPage.tsx – RF3: Gestión y triage de reportes por el funcionario.
 *
 * Panel que permite al funcionario ver todos los reportes del sistema,
 * cambiar su estado y nivel de urgencia, y revisar el historial de cada caso.
 *
 * Si el usuario no tiene sesión activa o no es funcionario, se le redirige a /inicio.
 */

import { useEffect, useState } from 'react';
import { IonBadge, IonButton, IonContent, IonIcon, IonItem, IonLabel, IonPage, IonSelect, IonSelectOption, useIonAlert, useIonRouter, useIonToast } from '@ionic/react';
import {
  alertCircleOutline,
  calendarOutline,
  chevronDownOutline,
  chevronUpOutline,
  timeOutline,
  trashOutline,
} from 'ionicons/icons';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../../core/auth/AuthContext';
import { deleteReport, getAllReports, updateReport as updateReportApi } from '../../../core/api/reportsApi';
import type { ApiPagination, ApiReport } from '../../../core/api/reportsApi';
import { usePageTitle } from '../../../core/hooks/usePageTitle';
import type { ReportStatus, UrgencyLevel } from '../../../core/data/ReportContext';
import '../../my-reports/presentation/MyReportsPage.css'; // Reutilizamos los estilos de "Mis Reportes"

// Configuración de etiquetas y colores para cada estado de reporte.
const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string }> = {
  pendiente: { label: 'Pendiente', color: 'medium' },
  verificado: { label: 'Verificado', color: 'primary' },
  agendado: { label: 'Agendado', color: 'warning' },
  en_proceso: { label: 'En proceso', color: 'tertiary' },
  resuelto: { label: 'Resuelto', color: 'success' },
};

const STATUS_FLOW: ReportStatus[] = ['pendiente', 'verificado', 'agendado', 'en_proceso', 'resuelto'];

// Mapea nivel de urgencia a un color Ionic para los badges.
const URGENCY_COLORS: Record<string, string> = {
  baja: 'success',
  media: 'warning',
  alta: 'danger',
};
const PAGE_SIZE = 10;

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
function AdminReportCard({
  report,
  onReportUpdated,
  onReportDeleted,
}: {
  report: ApiReport;
  onReportUpdated: (updated: ApiReport) => void;
  onReportDeleted: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { token } = useAuth();
  const [presentToast] = useIonToast();
  const [presentAlert] = useIonAlert();

  const statusConfig = STATUS_CONFIG[report.status];
  const urgencyColor = URGENCY_COLORS[report.urgency] ?? 'medium';

  const handleStatusChange = (newStatus: ReportStatus) => {
    if (newStatus === report.status) return;

    const isRollback = STATUS_FLOW.indexOf(newStatus) < STATUS_FLOW.indexOf(report.status);

    // Confirmamos cada cambio de estado para que el funcionario pueda dejar contexto en el historial.
    // Si es retroceso, marcamos el aviso como destructivo porque el backend limpiará información posterior.
    presentAlert({
      header: isRollback ? 'Confirmar retroceso de estado' : 'Confirmar cambio de estado',
      message: isRollback
        ? `Vas a retroceder de "${STATUS_CONFIG[report.status].label}" a "${STATUS_CONFIG[newStatus].label}". Se eliminarán las etapas posteriores y se limpiarán los comentarios anteriores del historial.`
        : `El reporte pasará a estado "${STATUS_CONFIG[newStatus].label}".`,
      inputs: [
        {
          name: 'comment',
          type: 'textarea',
          placeholder: 'Comentario opcional para la línea de tiempo',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: isRollback ? 'Confirmar retroceso' : 'Confirmar',
          role: isRollback ? 'destructive' : 'confirm',
          handler: async (data?: { comment?: string }) => {
            try {
              const comment = data?.comment?.trim() || null;
              const res = await updateReportApi(token!, String(report.id), {
                status: newStatus,
                comment,
              });
              onReportUpdated(res.report);
              presentToast({ message: 'Estado actualizado.', duration: 2500, position: 'top', color: 'success' });
            } catch {
              presentToast({ message: 'No se pudo actualizar el estado.', duration: 3000, position: 'top', color: 'danger' });
            }
          },
        },
      ],
    });
  };

  const handleUrgencyChange = async (newUrgency: UrgencyLevel) => {
    if (newUrgency === report.urgency) return;
    try {
      const res = await updateReportApi(token!, String(report.id), { urgency: newUrgency });
      onReportUpdated(res.report);
    } catch {
      presentToast({ message: 'No se pudo actualizar la urgencia.', duration: 3000, position: 'top', color: 'danger' });
    }
  };

  const handleDelete = () => {
    presentAlert({
      header: 'Eliminar reporte',
      message: `¿Estás seguro de que deseas eliminar el reporte "${report.street}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await deleteReport(token!, report.id);
              onReportDeleted(report.id);
              presentToast({ message: 'Reporte eliminado.', duration: 2500, position: 'top', color: 'success' });
            } catch {
              presentToast({ message: 'No se pudo eliminar el reporte.', duration: 3000, position: 'top', color: 'danger' });
            }
          },
        },
      ],
    });
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
                onIonChange={e => handleStatusChange(e.detail.value as ReportStatus)}
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

            <IonButton fill="outline" color="danger" onClick={handleDelete} style={{ marginTop: '12px' }}>
              <IonIcon icon={trashOutline} slot="start" />
              Eliminar reporte
            </IonButton>
          </div>

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

// Página principal de administración de reportes, accesible solo para funcionarios (RF3).
export function AdminReportsPage() {
  usePageTitle('Administración de Reportes - Programa No+Cables');

  const { user, isLoading, token } = useAuth();
  const [presentToast] = useIonToast();
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const router = useIonRouter();
  const location = useLocation();

  // Redirigir si no hay sesión o no es admin
  useEffect(() => {
    if (isLoading || location.pathname !== '/admin-reportes') {
      return;
    }

    if (!user) {
      router.push('/login', 'root');
    } else if (user.role !== 'funcionario') {
      router.push('/inicio', 'root');
    }
  }, [router, user, isLoading, location.pathname]);

  // Se cargan los reportes del sistema cuando la sesión está lista
  useEffect(() => {
    if (isLoading || !token || !user || user.role !== 'funcionario') return;

    setIsLoadingReports(true);
    getAllReports(token, page, PAGE_SIZE)
      .then((res) => {
        setReports(res.reports);
        setPagination(res.pagination);
      })
      .catch(() =>
        presentToast({
          message: 'No se pudieron cargar los reportes.',
          duration: 3000,
          position: 'top',
          color: 'danger',
        }),
      )
      .finally(() => setIsLoadingReports(false));
  }, [token, isLoading, page]);

  if (isLoading || !user || user.role !== 'funcionario') {
    return null;
  }

  // Ordenar reportes más recientes primero
  const allReports = [...reports].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  function handleReportUpdated(updated: ApiReport) {
    // Reemplazamos solo el reporte modificado para no perder el estado expandido del resto
    setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  function handleReportDeleted(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

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
          {isLoadingReports ? (
            <section className="my-reports-empty" aria-label="Cargando">
              <p>Cargando reportes...</p>
            </section>
          ) : allReports.length > 0 ? (
            <>
              <div className="my-reports-list">
                {allReports.map((report) => (
                  <AdminReportCard key={report.id} report={report} onReportUpdated={handleReportUpdated} onReportDeleted={handleReportDeleted} />
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
              <h2>No hay reportes en el sistema</h2>
              <p>Actualmente no se han ingresado reportes por los ciudadanos.</p>
            </section>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}

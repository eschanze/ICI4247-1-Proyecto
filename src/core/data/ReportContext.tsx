// Mantenemos todo en un array de reportes en estado React... 
// En la EP2 se reemplazará por llamadas al API REST del backend.
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

/* Niveles de urgencia percibida que puede indicar el ciudadano. */
export type UrgencyLevel = 'baja' | 'media' | 'alta';

/* Estados posibles dentro del ciclo de vida de un reporte (RF3). */
export type ReportStatus = 'pendiente' | 'verificado' | 'agendado' | 'en_proceso' | 'resuelto';

/* Entrada del historial de cambios de estado de un reporte. */
export interface StatusHistoryEntry {
  status: ReportStatus;        // estado al que se cambió
  date: string;                // fecha ISO del cambio
  comment?: string;            // comentario opcional del funcionario
}

/* Estructura completa de un reporte de incidente. */
export interface Report {
  id: string;                   // identificador único generado al crear
  authorUsername: string;       // nombre de usuario del ciudadano que reportó
  street: string;               // dirección: nombre de calle y número
  description: string;          // descripción libre del problema
  urgency: UrgencyLevel;        // urgencia percibida por el ciudadano
  photoDataUrl: string | null;  // foto adjunta codificada como Data URL, o null si no tiene
  status: ReportStatus;         // estado actual del reporte
  createdAt: string;            // fecha de creación en formato ISO
  scheduledDate: string | null; // fecha programada de retiro (asignada por funcionario)
  statusHistory: StatusHistoryEntry[]; // historial completo de cambios de estado
}

/* Datos que el ciudadano provee al crear un nuevo reporte (sin los campos automáticos). */
export interface NewReportData {
  street: string;
  description: string;
  urgency: UrgencyLevel;
  photoDataUrl: string | null;
}

/* Forma del contexto que consumen los componentes. */
interface ReportContextValue {
  reports: Report[];                                            // todos los reportes almacenados (en la demo, solo en memoria)
  addReport: (data: NewReportData, authorUsername: string) => void;  // crea un reporte nuevo y lo agrega al array
  getReportsByUser: (username: string) => Report[];              // retorna solo los reportes creados por el usuario indicado
}

const SEED_REPORTS: Report[] = [
  {
    id: crypto.randomUUID(),
    authorUsername: 'ciudadano',
    street: 'Av. Libertad 1420',
    description: 'Cables colgando a baja altura sobre la vereda. Es un peligro para peatones y ciclistas en la vía.',
    urgency: 'alta',
    photoDataUrl: null,
    status: 'verificado',
    createdAt: '2026-04-28T10:15:00.000Z',
    scheduledDate: '2026-05-20',
    statusHistory: [
      { status: 'pendiente', date: '2026-04-28T10:15:00.000Z' },
      { status: 'verificado', date: '2026-04-30T14:22:00.000Z', comment: 'Verificado en terreno por funcionario Pepito Pérez.' },
    ],
  },
  {
    id: crypto.randomUUID(),
    authorUsername: 'ciudadano',
    street: 'Pasaje Miraflores 78',
    description: 'Cable de telecomunicaciones en desuso apoyado sobre un árbol. Riesgo de caída si hay viento.',
    urgency: 'media',
    photoDataUrl: null,
    status: 'resuelto',
    createdAt: '2026-03-12T16:45:00.000Z',
    scheduledDate: '2026-04-02',
    statusHistory: [
      { status: 'pendiente', date: '2026-03-12T16:45:00.000Z' },
      { status: 'verificado', date: '2026-03-14T09:10:00.000Z', comment: 'Cable corresponde a VTR. Se coordina retiro.' },
      { status: 'agendado', date: '2026-03-20T11:00:00.000Z', comment: 'Retiro agendado para el 02/04.' },
      { status: 'en_proceso', date: '2026-04-02T08:00:00.000Z' },
      { status: 'resuelto', date: '2026-04-02T12:30:00.000Z', comment: 'Cable retirado exitosamente. Caso cerrado.' },
    ],
  },
];

const ReportContext = createContext<ReportContextValue | null>(null);

/*
 * ReportProvider mantiene el estado global de reportes y lo expone a toda la app.
 * En esta versión demo, los datos viven en useState y se pierden al recargar la página.
 */
export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);

  const addReport = useCallback((data: NewReportData, authorUsername: string) => {
    const now = new Date().toISOString();

    const newReport: Report = {
      id: crypto.randomUUID(),
      authorUsername,
      street: data.street,
      description: data.description,
      urgency: data.urgency,
      photoDataUrl: data.photoDataUrl,
      status: 'pendiente',
      createdAt: now,
      scheduledDate: null,
      statusHistory: [{ status: 'pendiente', date: now }],
    };

    // setReports recibe una función (prev => [...prev, newReport]) en vez de un valor directo.
    // Garantiza que siempre trabajamos con el estado más reciente.
    setReports((prev) => [...prev, newReport]);
  }, []);

  // Memoizamos la función; depende de reports
  const getReportsByUser = useCallback(
    (username: string) => reports.filter((report) => report.authorUsername === username),
    [reports],
  );

  return (
    <ReportContext.Provider value={{ reports, addReport, getReportsByUser }}>
      {children}
    </ReportContext.Provider>
  );
}

// Custom hook para no tener que importar el context y usar useContext manualmente en cada componente
// basta con: const { reports, addReport, getReportsByUser } = useReports();
export function useReports(): ReportContextValue {
  const context = useContext(ReportContext);

  if (!context) {
    throw new Error('useReports debe usarse dentro de <ReportProvider>');
  }

  return context;
}

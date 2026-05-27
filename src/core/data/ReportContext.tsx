// Mantenemos todo en un array de reportes en estado React... 
// En la EP2 se reemplazará por llamadas al API REST del backend.
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Niveles de urgencia percibida que puede indicar el ciudadano.
export type UrgencyLevel = 'baja' | 'media' | 'alta';

// Estados posibles dentro del ciclo de vida de un reporte (RF3).
export type ReportStatus = 'pendiente' | 'verificado' | 'agendado' | 'en_proceso' | 'resuelto';

// Entrada del historial de cambios de estado.
export interface StatusHistoryEntry {
  status: ReportStatus;
  date: string;
  comment?: string;
}

// Estructura completa de un reporte.
export interface Report {
  id: string;
  authorUsername: string;
  street: string;
  description: string;
  urgency: UrgencyLevel;
  photoDataUrl: string | null;  // Data URL de la foto adjunta, o null
  status: ReportStatus;
  createdAt: string;            // formato ISO
  scheduledDate: string | null; // asignada por el funcionario
  statusHistory: StatusHistoryEntry[];
}

// Datos que el ciudadano provee al crear un nuevo reporte (sin los campos automáticos).
export interface NewReportData {
  street: string;
  description: string;
  urgency: UrgencyLevel;
  photoDataUrl: string | null;
}

// Forma del contexto que consumen los componentes.
interface ReportContextValue {
  reports: Report[];
  addReport: (data: NewReportData, authorUsername: string) => void;
  getReportsByUser: (username: string) => Report[];
  updateReport: (id: string, updates: Partial<Report>, comment?: string) => void;
}

const SEED_REPORTS: Report[] = [
  {
    id: crypto.randomUUID(),
    authorUsername: 'ciudadano',
    street: 'Av. Florida 6131',
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
    street: 'Los Pajaritos 245',
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

// ReportProvider mantiene el estado global de reportes y lo expone a toda la app.
// En esta versión demo, los datos viven en useState y se pierden al recargar la página.
export function ReportProvider({ children }: { children: ReactNode }) {
  const [reports, setReports] = useState<Report[]>(SEED_REPORTS);

  const addReport = (data: NewReportData, authorUsername: string) => {
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
  };

  const updateReport = (id: string, updates: Partial<Report>, comment?: string) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id !== id) return report;
        
        const updatedReport = { ...report, ...updates };
        
        // Si el estado cambia, registrarlo en el historial automáticamente (RF3)
        if (updates.status && updates.status !== report.status) {
          updatedReport.statusHistory = [
            ...report.statusHistory,
            { status: updates.status, date: new Date().toISOString(), comment },
          ];
        }
        
        return updatedReport;
      }),
    );
  };

  const getReportsByUser = (username: string) => reports.filter((report) => report.authorUsername === username);

  return (
    <ReportContext.Provider value={{ reports, addReport, getReportsByUser, updateReport }}>
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

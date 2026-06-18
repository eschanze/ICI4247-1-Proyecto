import { apiRequest } from './apiClient';
import type { ReportStatus, UrgencyLevel } from '../data/ReportContext';

// Estos tipos reflejan el contrato real del backend para reemplazar el estado local de reportes.
export interface ApiStatusHistoryEntry {
  status: ReportStatus;
  date: string;
  comment?: string;
}

export interface ApiReport {
  id: string;
  authorUsername: string;
  street: string;
  description: string;
  urgency: UrgencyLevel;
  photoUrl: string | null;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  scheduledDate: string | null;
  statusHistory: ApiStatusHistoryEntry[];
}

interface ReportResponse {
  report: ApiReport;
}

interface ReportsResponse {
  reports: ApiReport[];
}

interface PublicReportStatsResponse {
  activeReports: number;
  participantNeighbors: number;
}

interface DeleteReportResponse {
  deletedReportId: string;
}

export function createReport(
  token: string,
  data: {
    street: string;
    description: string;
    urgency: UrgencyLevel;
    photoUrl: string | null;
  },
): Promise<ReportResponse> {
  // Enviamos photoUrl aunque por ahora puede ser null o un data URL temporal...
  return apiRequest<ReportResponse>('/reports', {
    method: 'POST',
    token,
    body: data,
  });
}

export function getMyReports(token: string): Promise<ReportsResponse> {
  return apiRequest<ReportsResponse>('/reports/my', { token });
}

export function getAllReports(token: string): Promise<ReportsResponse> {
  // El backend valida que este token pertenezca a un funcionario
  return apiRequest<ReportsResponse>('/reports', { token });
}

export function getPublicReportStats(): Promise<PublicReportStatsResponse> {
  return apiRequest<PublicReportStatsResponse>('/reports/stats');
}

export function getReportById(token: string, id: string): Promise<ReportResponse> {
  return apiRequest<ReportResponse>(`/reports/${id}`, { token });
}

export function updateReport(
  token: string,
  id: string,
  data: {
    status?: ReportStatus;
    urgency?: UrgencyLevel;
    scheduledDate?: string | null;
    comment?: string | null;
  },
): Promise<ReportResponse> {
  // El backend agrega historial solo cuando el estado realmente cambia
  return apiRequest<ReportResponse>(`/reports/${id}`, {
    method: 'PATCH',
    token,
    body: data,
  });
}

export function deleteReport(token: string, id: string): Promise<DeleteReportResponse> {
  return apiRequest<DeleteReportResponse>(`/reports/${id}`, {
    method: 'DELETE',
    token,
  });
}

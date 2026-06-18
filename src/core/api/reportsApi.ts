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
  latitude: number | null;
  longitude: number | null;
  geocodingStatus: 'pendiente' | 'ok' | 'fallido' | 'sin_api_key';
  statusHistory: ApiStatusHistoryEntry[];
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiMapReport {
  id: string;
  street: string;
  urgency: UrgencyLevel;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  createdAt: string;
}

interface ReportResponse {
  report: ApiReport;
}

interface ReportsResponse {
  reports: ApiReport[];
  pagination: ApiPagination;
}

interface MapReportsResponse {
  reports: ApiMapReport[];
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

function buildPaginationQuery(page = 1, pageSize = 10): string {
  return `page=${page}&pageSize=${pageSize}`;
}

export function getMyReports(token: string, page = 1, pageSize = 10): Promise<ReportsResponse> {
  return apiRequest<ReportsResponse>(`/reports/my?${buildPaginationQuery(page, pageSize)}`, { token });
}

export function getAllReports(token: string, page = 1, pageSize = 10): Promise<ReportsResponse> {
  // El backend valida que este token pertenezca a un funcionario
  return apiRequest<ReportsResponse>(`/reports?${buildPaginationQuery(page, pageSize)}`, { token });
}

export function getPublicReportStats(): Promise<PublicReportStatsResponse> {
  return apiRequest<PublicReportStatsResponse>('/reports/stats');
}

export function getMapReports(): Promise<MapReportsResponse> {
  return apiRequest<MapReportsResponse>('/reports/map');
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

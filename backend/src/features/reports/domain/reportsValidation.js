export const URGENCY_VALUES = new Set(['baja', 'media', 'alta']);
export const STATUS_VALUES = new Set(['pendiente', 'verificado', 'agendado', 'en_proceso', 'resuelto']);
export const STATUS_ORDER = {
  pendiente: 0,
  verificado: 1,
  agendado: 2,
  en_proceso: 3,
  resuelto: 4,
};
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

export function badRequest(message) {
  return {
    data: null,
    error: { message },
  };
}

export function parseReportId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

export function parsePagination(query = {}) {
  const rawPage = Number(query.page);
  const rawPageSize = Number(query.pageSize);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  const pageSize = Number.isInteger(rawPageSize) && rawPageSize > 0
    ? Math.min(rawPageSize, MAX_PAGE_SIZE)
    : DEFAULT_PAGE_SIZE;

  return {
    page,
    pageSize,
    offset: (page - 1) * pageSize,
  };
}

export function buildPaginationMeta(totalItems, page, pageSize) {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

export function formatDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export function publicReport(row, history = []) {
  // Devolvemos camelCase para que el frontend no tenga que conocer nombres SQL
  return {
    id: String(row.id),
    authorUsername: row.author_username,
    street: row.street,
    description: row.description,
    urgency: row.urgency,
    photoUrl: row.photo_url,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    scheduledDate: formatDateOnly(row.scheduled_date),
    latitude: row.latitude === null || row.latitude === undefined ? null : Number(row.latitude),
    longitude: row.longitude === null || row.longitude === undefined ? null : Number(row.longitude),
    geocodingStatus: row.geocoding_status,
    statusHistory: history.map((entry) => ({
      status: entry.status,
      date: entry.created_at,
      comment: entry.comment || undefined,
    })),
  };
}

export function validateNewReport(body = {}) {
  const street = String(body.street || '').trim();
  const description = String(body.description || '').trim();
  const urgency = String(body.urgency || '').trim();
  const photoUrl = body.photoUrl === null || body.photoUrl === undefined ? null : String(body.photoUrl);

  if (!street || street.length > 160) {
    return { error: 'La direccion es obligatoria y no puede superar 160 caracteres' };
  }

  if (!description) {
    return { error: 'La descripcion es obligatoria' };
  }

  if (!URGENCY_VALUES.has(urgency)) {
    return { error: 'La urgencia debe ser baja, media o alta' };
  }

  return { street, description, urgency, photoUrl };
}

export function validateReportUpdate(body = {}) {
  const updates = {};
  const hasStatus = Object.prototype.hasOwnProperty.call(body, 'status');
  const hasUrgency = Object.prototype.hasOwnProperty.call(body, 'urgency');
  const hasScheduledDate = Object.prototype.hasOwnProperty.call(body, 'scheduledDate');
  const hasComment = Object.prototype.hasOwnProperty.call(body, 'comment');

  if (hasStatus) {
    const status = String(body.status || '').trim();

    if (!STATUS_VALUES.has(status)) {
      return { error: 'El estado enviado no es valido' };
    }

    updates.status = status;
  }

  if (hasUrgency) {
    const urgency = String(body.urgency || '').trim();

    if (!URGENCY_VALUES.has(urgency)) {
      return { error: 'La urgencia debe ser baja, media o alta' };
    }

    updates.urgency = urgency;
  }

  if (hasScheduledDate) {
    if (body.scheduledDate === null || body.scheduledDate === '') {
      updates.scheduledDate = null;
    } else {
      const scheduledDate = String(body.scheduledDate).trim();

      if (!DATE_PATTERN.test(scheduledDate) || Number.isNaN(Date.parse(scheduledDate))) {
        return { error: 'La fecha programada debe tener formato YYYY-MM-DD' };
      }

      updates.scheduledDate = scheduledDate;
    }
  }

  if (hasComment) {
    updates.comment = body.comment === null || body.comment === undefined
      ? null
      : String(body.comment).trim();
  }

  if (!hasStatus && !hasUrgency && !hasScheduledDate) {
    return { error: 'Debe enviar al menos un campo actualizable' };
  }

  return updates;
}

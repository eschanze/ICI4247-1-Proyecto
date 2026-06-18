import { Router } from 'express';

import { pool } from '../db/pool.js';
import { requireAuth, requireFuncionario } from '../middleware/auth.middleware.js';
import { geocodeReportStreet } from '../services/geocoding.service.js';

export const reportsRouter = Router();

const URGENCY_VALUES = new Set(['baja', 'media', 'alta']);
const STATUS_VALUES = new Set(['pendiente', 'verificado', 'agendado', 'en_proceso', 'resuelto']);
const STATUS_ORDER = {
  pendiente: 0,
  verificado: 1,
  agendado: 2,
  en_proceso: 3,
  resuelto: 4,
};
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;
const CACHE_TTL_MS = 30 * 1000;
const cache = new Map();

function badRequest(message) {
  return {
    data: null,
    error: { message },
  };
}

function parseReportId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function parsePagination(query = {}) {
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

function buildPaginationMeta(totalItems, page, pageSize) {
  return {
    page,
    pageSize,
    totalItems,
    totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
  };
}

function getCache(key) {
  const entry = cache.get(key);

  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

function setCache(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

function clearReportCache() {
  // Borramos todo porque es un cache chico y solo contiene lecturas de reportes.
  cache.clear();
}

function formatDateOnly(value) {
  if (!value) return null;
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

function publicReport(row, history = []) {
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

async function getReportRows(whereSql = '', values = [], tailSql = '') {
  // Centralizamos la consulta base para mantener el mismo formato en listados y detalle
  const result = await pool.query(
    `
      SELECT
        reports.id,
        reports.user_id,
        users.username AS author_username,
        reports.street,
        reports.description,
        reports.urgency,
        reports.status,
        reports.scheduled_date,
        reports.photo_url,
        reports.latitude,
        reports.longitude,
        reports.geocoding_status,
        reports.created_at,
        reports.updated_at
      FROM reports
      INNER JOIN users ON users.id = reports.user_id
      ${whereSql}
      ORDER BY reports.created_at DESC
      ${tailSql}
    `,
    values,
  );

  return result.rows;
}

async function getPaginatedReportRows(whereSql = '', values = [], { page, pageSize, offset }) {
  const rows = await getReportRows(
    whereSql,
    [...values, pageSize, offset],
    `LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
  );

  const countResult = await pool.query(
    `
      SELECT COUNT(*)::int AS total
      FROM reports
      ${whereSql}
    `,
    values,
  );

  return {
    rows,
    pagination: buildPaginationMeta(countResult.rows[0].total, page, pageSize),
  };
}

async function getHistoryByReportIds(reportIds) {
  if (reportIds.length === 0) {
    return new Map();
  }

  // Traemos el historial en una sola consulta para evitar consultar reporte por reporte
  const result = await pool.query(
    `
      SELECT report_id, status, comment, created_at
      FROM report_status_history
      WHERE report_id = ANY($1::int[])
      ORDER BY created_at ASC
    `,
    [reportIds],
  );

  const historyByReportId = new Map();

  for (const row of result.rows) {
    const reportHistory = historyByReportId.get(row.report_id) || [];
    reportHistory.push(row);
    historyByReportId.set(row.report_id, reportHistory);
  }

  return historyByReportId;
}

async function getReportById(reportId) {
  const rows = await getReportRows('WHERE reports.id = $1', [reportId]);
  return rows[0] || null;
}

function validateNewReport(body = {}) {
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

function validateReportUpdate(body = {}) {
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

reportsRouter.get('/stats', async (_req, res, next) => {
  try {
    const cached = getCache('report-stats');

    if (cached) {
      return res.json(cached);
    }

    // Dejamos esta métrica pública porque /inicio la usa antes de que exista sesión.
    const result = await pool.query(
      `
        SELECT
          COUNT(*) FILTER (WHERE reports.status <> 'resuelto')::int AS active_reports,
          (
            SELECT COUNT(*)::int
            FROM users
            WHERE role = 'ciudadano'
          ) AS participant_neighbors
        FROM reports
      `,
    );

    const payload = {
      data: {
        activeReports: result.rows[0].active_reports,
        participantNeighbors: result.rows[0].participant_neighbors,
      },
      error: null,
    };

    setCache('report-stats', payload);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

reportsRouter.get('/map', async (_req, res, next) => {
  try {
    const cached = getCache('report-map');

    if (cached) {
      return res.json(cached);
    }

    const result = await pool.query(
      `
        SELECT id, street, urgency, status, latitude, longitude, created_at
        FROM reports
        WHERE latitude IS NOT NULL
          AND longitude IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 500
      `,
    );

    const payload = {
      data: {
        reports: result.rows.map((row) => ({
          id: String(row.id),
          street: row.street,
          urgency: row.urgency,
          status: row.status,
          latitude: Number(row.latitude),
          longitude: Number(row.longitude),
          createdAt: row.created_at,
        })),
      },
      error: null,
    };

    setCache('report-map', payload);
    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

reportsRouter.use(requireAuth);

reportsRouter.post('/', async (req, res, next) => {
  // Solo los ciudadanos crean reportes; los funcionarios gestionan los existentes
  if (req.user.role !== 'ciudadano') {
    return res.status(403).json({
      data: null,
      error: { message: 'Solo los ciudadanos pueden crear reportes' },
    });
  }

  const input = validateNewReport(req.body);

  if (input.error) {
    return res.status(400).json(badRequest(input.error));
  }

  const geocoding = await geocodeReportStreet(input.street);
  const client = await pool.connect();

  try {
    // Usamos transacción para crear el reporte y su primer historial como una sola operación
    await client.query('BEGIN');

    const reportResult = await client.query(
      `
        INSERT INTO reports (
          user_id,
          street,
          description,
          urgency,
          photo_url,
          latitude,
          longitude,
          geocoding_status,
          geocoded_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8::varchar, CASE WHEN $8::varchar = 'ok' THEN NOW() ELSE NULL END)
        RETURNING id
      `,
      [
        req.user.id,
        input.street,
        input.description,
        input.urgency,
        input.photoUrl,
        geocoding.latitude,
        geocoding.longitude,
        geocoding.status,
      ],
    );

    const reportId = reportResult.rows[0].id;

    await client.query(
      `
        INSERT INTO report_status_history (report_id, status, comment, changed_by_user_id)
        VALUES ($1, 'pendiente', $2, $3)
      `,
      [reportId, 'Reporte creado por ciudadano', req.user.id],
    );

    await client.query('COMMIT');
    clearReportCache();

    const report = await getReportById(reportId);
    const historyByReportId = await getHistoryByReportIds([reportId]);

    return res.status(201).json({
      data: { report: publicReport(report, historyByReportId.get(reportId) || []) },
      error: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

reportsRouter.get('/my', async (req, res, next) => {
  try {
    const paginationInput = parsePagination(req.query);
    const { rows, pagination } = await getPaginatedReportRows(
      'WHERE reports.user_id = $1',
      [req.user.id],
      paginationInput,
    );
    const historyByReportId = await getHistoryByReportIds(rows.map((row) => row.id));

    return res.json({
      data: {
        reports: rows.map((row) => publicReport(row, historyByReportId.get(row.id) || [])),
        pagination,
      },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

reportsRouter.get('/', requireFuncionario, async (req, res, next) => {
  try {
    const paginationInput = parsePagination(req.query);
    const { rows, pagination } = await getPaginatedReportRows('', [], paginationInput);
    const historyByReportId = await getHistoryByReportIds(rows.map((row) => row.id));

    return res.json({
      data: {
        reports: rows.map((row) => publicReport(row, historyByReportId.get(row.id) || [])),
        pagination,
      },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

reportsRouter.get('/:id', async (req, res, next) => {
  const reportId = parseReportId(req.params.id);

  if (!reportId) {
    return res.status(400).json(badRequest('Id de reporte invalido'));
  }

  try {
    const report = await getReportById(reportId);

    if (!report) {
      return res.status(404).json({
        data: null,
        error: { message: 'Reporte no encontrado' },
      });
    }

    // Los ciudadanos solo pueden ver sus propios reportes
    if (req.user.role !== 'funcionario' && report.user_id !== req.user.id) {
      return res.status(403).json({
        data: null,
        error: { message: 'No tienes permiso para ver este reporte' },
      });
    }

    const historyByReportId = await getHistoryByReportIds([reportId]);

    return res.json({
      data: { report: publicReport(report, historyByReportId.get(reportId) || []) },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

reportsRouter.patch('/:id', requireFuncionario, async (req, res, next) => {
  const reportId = parseReportId(req.params.id);

  if (!reportId) {
    return res.status(400).json(badRequest('Id de reporte invalido'));
  }

  const input = validateReportUpdate(req.body);

  if (input.error) {
    return res.status(400).json(badRequest(input.error));
  }

  const client = await pool.connect();

  try {
    // Agrupamos actualización e historial para no dejar cambios incompletos
    await client.query('BEGIN');

    const currentResult = await client.query(
      'SELECT id, status FROM reports WHERE id = $1 LIMIT 1',
      [reportId],
    );
    const currentReport = currentResult.rows[0];

    if (!currentReport) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        data: null,
        error: { message: 'Reporte no encontrado' },
      });
    }

    const fields = [];
    const values = [];

    if (input.status) {
      values.push(input.status);
      fields.push(`status = $${values.length}`);
    }

    if (input.urgency) {
      values.push(input.urgency);
      fields.push(`urgency = $${values.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(input, 'scheduledDate')) {
      values.push(input.scheduledDate);
      fields.push(`scheduled_date = $${values.length}`);
    }

    values.push(reportId);

    await client.query(
      `
        UPDATE reports
        SET ${fields.join(', ')}
        WHERE id = $${values.length}
      `,
      values,
    );

    // Solo agregamos historial cuando cambia realmente el estado
    if (input.status && input.status !== currentReport.status) {
      const isStatusRollback = STATUS_ORDER[input.status] < STATUS_ORDER[currentReport.status];

      if (isStatusRollback) {
        // Al retroceder, mantenemos solo la línea de tiempo que sigue siendo válida para el estado actual.
        const statusesToDiscard = Object.entries(STATUS_ORDER)
          .filter(([, order]) => order > STATUS_ORDER[input.status])
          .map(([status]) => status);

        await client.query(
          `
            DELETE FROM report_status_history
            WHERE report_id = $1
              AND status = ANY($2::text[])
          `,
          [reportId, statusesToDiscard],
        );

        await client.query(
          `
            UPDATE report_status_history
            SET comment = NULL
            WHERE report_id = $1
          `,
          [reportId],
        );
      }

      await client.query(
        `
          INSERT INTO report_status_history (report_id, status, comment, changed_by_user_id)
          VALUES ($1, $2, $3, $4)
        `,
        [reportId, input.status, input.comment || null, req.user.id],
      );
    }

    await client.query('COMMIT');
    clearReportCache();

    const report = await getReportById(reportId);
    const historyByReportId = await getHistoryByReportIds([reportId]);

    return res.json({
      data: { report: publicReport(report, historyByReportId.get(reportId) || []) },
      error: null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
});

reportsRouter.delete('/:id', requireFuncionario, async (req, res, next) => {
  const reportId = parseReportId(req.params.id);

  if (!reportId) {
    return res.status(400).json(badRequest('Id de reporte invalido'));
  }

  try {
    const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [reportId]);

    if (!result.rows[0]) {
      return res.status(404).json({
        data: null,
        error: { message: 'Reporte no encontrado' },
      });
    }

    clearReportCache();

    return res.json({
      data: { deletedReportId: String(reportId) },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

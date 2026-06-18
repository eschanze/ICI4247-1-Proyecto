import { pool } from '../../../core/database/pool.js';
import { buildPaginationMeta, STATUS_ORDER } from '../domain/reportsValidation.js';

export const CACHE_TTL_MS = 30 * 1000;
export const cache = new Map();

export function getCache(key) {
  const entry = cache.get(key);

  if (!entry || entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCache(key, value) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearReportCache() {
  // Borramos todo porque es un cache chico y solo contiene lecturas de reportes.
  cache.clear();
}

export async function getReportRows(whereSql = '', values = [], tailSql = '') {
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

export async function getPaginatedReportRows(whereSql = '', values = [], { page, pageSize, offset }) {
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

export async function getHistoryByReportIds(reportIds) {
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

export async function getReportById(reportId) {
  const rows = await getReportRows('WHERE reports.id = $1', [reportId]);
  return rows[0] || null;
}

export async function createReport(client, { userId, street, description, urgency, photoUrl, latitude, longitude, geocodingStatus }) {
  // Usamos transacción para crear el reporte y su primer historial como una sola operación
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
    [userId, street, description, urgency, photoUrl, latitude, longitude, geocodingStatus],
  );

  const reportId = reportResult.rows[0].id;

  await client.query(
    `
      INSERT INTO report_status_history (report_id, status, comment, changed_by_user_id)
      VALUES ($1, 'pendiente', $2, $3)
    `,
    [reportId, 'Reporte creado por ciudadano', userId],
  );

  return reportId;
}

export async function updateReport(client, reportId, currentReport, input, userId) {
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
      [reportId, input.status, input.comment || null, userId],
    );
  }
}

export async function deleteReport(reportId) {
  const result = await pool.query('DELETE FROM reports WHERE id = $1 RETURNING id', [reportId]);
  return result.rows[0] || null;
}

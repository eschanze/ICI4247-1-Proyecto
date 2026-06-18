import { Router } from 'express';
import { pool } from '../../../../core/database/pool.js';
import { requireAuth, requireFuncionario } from '../../../../core/middleware/auth.middleware.js';
import { geocodeReportStreet } from '../../data/reportsGeocoding.js';
import {
  badRequest,
  parseReportId,
  parsePagination,
  publicReport,
  validateNewReport,
  validateReportUpdate,
} from '../../domain/reportsValidation.js';
import {
  getCache,
  setCache,
  clearReportCache,
  getPaginatedReportRows,
  getHistoryByReportIds,
  getReportById,
  createReport,
  updateReport,
  deleteReport,
} from '../../data/reportsRepository.js';

export const reportsRouter = Router();

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
    await client.query('BEGIN');
    
    const reportId = await createReport(client, {
      userId: req.user.id,
      street: input.street,
      description: input.description,
      urgency: input.urgency,
      photoUrl: input.photoUrl,
      latitude: geocoding.latitude,
      longitude: geocoding.longitude,
      geocodingStatus: geocoding.status,
    });

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

    await updateReport(client, reportId, currentReport, input, req.user.id);

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
    const deletedReport = await deleteReport(reportId);

    if (!deletedReport) {
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

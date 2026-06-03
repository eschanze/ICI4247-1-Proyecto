import { Router } from 'express';

import { pool } from '../db/pool.js';

export const healthRouter = Router();

healthRouter.get('/health', (req, res) => {
  res.json({
    data: {
      service: 'no-cables-api',
      status: 'ok',
    },
    error: null,
  });
});

healthRouter.get('/db-health', async (req, res) => {
  try {
    // Hacemos una consulta liviana para confirmar que PostgreSQL responde
    const result = await pool.query('SELECT NOW() AS checked_at');

    res.json({
      data: {
        database: 'ok',
        checkedAt: result.rows[0].checked_at,
      },
      error: null,
    });
  } catch (error) {
    res.status(503).json({
      data: null,
      error: {
        message: 'No se pudo conectar a la base de datos',
      },
    });
  }
});

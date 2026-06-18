import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { env } from './config/env.js';
import { authRouter } from './routes/auth.routes.js';
import { healthRouter } from './routes/health.routes.js';
import { reportsRouter } from './routes/reports.routes.js';

// Función principal para crear la aplicación Express
export function createApp() {
  const app = express();

  // Headers HTTP de seguridad (X-Content-Type-Options, X-Frame-Options, etc.)
  app.use(helmet());

  // Limitador de tasa: máximo 100 solicitudes por IP cada 5 minutos
  app.use(rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { data: null, error: { message: 'Demasiadas solicitudes. Intenta de nuevo más tarde.' } },
  }));

  // Configuramos CORS para permitir los orígenes locales usados por Vite en desarrollo.
  app.use(cors({
    origin(origin, callback) {
      if (!origin || env.frontendOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origen no permitido por CORS'));
    },
  }));
  // Configuramos Express para parsear JSON con un límite máximo de 1MB (medida contra ataques que utilizan payloads grandes)
  app.use(express.json({ limit: '1mb' }));

  // Ruta de salud para verificar que el servidor está funcionando correctamente
  app.use('/api', healthRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/reports', reportsRouter);

  // Manejo de rutas no encontradas (404) y errores generales (500)
  app.use((req, res) => {
    res.status(404).json({
      data: null,
      error: { message: 'Ruta no encontrada' },
    });
  });

  app.use((err, req, res, next) => {
    void next;

    const statusCode = err.statusCode || 500;

    if (env.nodeEnv === 'development') {
      console.error(err);
    }

    res.status(statusCode).json({
      data: null,
      error: {
        message: statusCode === 500 ? 'Error interno del servidor' : err.message,
      },
    });
  });

  return app;
}

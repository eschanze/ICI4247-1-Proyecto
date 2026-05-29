import cors from 'cors';
import express from 'express';

import { env } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';

// Función principal para crear la aplicación Express
export function createApp() {
  const app = express();

  // Configuramos CORS para permitir solicitudes desde el origen del frontend especificado en .env.frontendOrigin
  app.use(cors({ origin: env.frontendOrigin }));
  // Configuramos Express para parsear JSON con un límite máximo de 1MB (medida contra ataques que utilizan payloads grandes)
  app.use(express.json({ limit: '1mb' }));

  // Ruta de salud para verificar que el servidor está funcionando correctamente
  app.use('/api', healthRouter);

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

    res.status(statusCode).json({
      data: null,
      error: {
        message: statusCode === 500 ? 'Error interno del servidor' : err.message,
      },
    });
  });

  return app;
}

import { createApp } from './app.js';
import { env } from './config/env.js';

// Iniciamos la aplicación Express y la ponemos a escuchar en el puerto especificado en .env.port
const app = createApp();

app.listen(env.port, () => {
  console.log(`No+Cables API escuchando en http://localhost:${env.port}/api`);
});

import { createApp } from './core/server/createApp.js';
import { env } from './core/config/env.js';

// Iniciamos la aplicación Express y la ponemos a escuchar en el puerto configurado
const app = createApp();

app.listen(env.port, () => {
  console.log(`No+Cables API escuchando en http://localhost:${env.port}/api`);
});

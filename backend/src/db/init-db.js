import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(currentDir, 'schema.sql');

try {
  const schema = await readFile(schemaPath, 'utf8');

  // Ejecutamos schema.sql para crear las tablas iniciales de la EP2
  await pool.query(schema);
  console.log('Base de datos inicializada correctamente.');
} catch (error) {
  console.error('No se pudo inicializar la base de datos.');
  console.error(error.message || error.code || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

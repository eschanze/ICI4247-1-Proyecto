import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pool } from './pool.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(currentDir, 'schema.sql');

try {
  const schema = await readFile(schemaPath, 'utf8');

  // Ejecutamos el esquema sin borrar datos; sirve para agregar columnas/índices nuevos.
  await pool.query(schema);
  console.log('Migración aplicada correctamente.');
} catch (error) {
  console.error('No se pudo aplicar la migración.');
  console.error(error.message || error.code || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

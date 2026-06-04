import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import bcrypt from 'bcryptjs';

import { pool } from './pool.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(currentDir, 'schema.sql');

const demoFuncionario = {
  username: 'funcionario_demo',
  rut: '11111111-1',
  email: 'funcionario.demo@nocables.cl',
  password: 'Funcionario123',
};

try {
  const schema = await readFile(schemaPath, 'utf8');

  // Ejecutamos schema.sql para crear las tablas iniciales de la EP2
  await pool.query(schema);

  const demoPasswordHash = await bcrypt.hash(demoFuncionario.password, 10);

  // Cuenta demo de funcionario para cuando el ayudante revise la EP2
  await pool.query(
    `
      INSERT INTO users (username, rut, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'funcionario')
      ON CONFLICT (username) DO UPDATE
      SET
        rut = EXCLUDED.rut,
        email = EXCLUDED.email,
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role
    `,
    [
      demoFuncionario.username,
      demoFuncionario.rut,
      demoFuncionario.email,
      demoPasswordHash,
    ],
  );

  console.log('Base de datos inicializada correctamente.');
  console.log(`Funcionario demo disponible: ${demoFuncionario.username}`);
} catch (error) {
  console.error('No se pudo inicializar la base de datos.');
  console.error(error.message || error.code || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

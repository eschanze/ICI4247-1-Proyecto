import { pool } from '../../../core/database/pool.js';

export async function createUser({ username, rut, email, passwordHash }) {
  // El registro público siempre crea ciudadanos; los funcionarios se crean de forma controlada
  const result = await pool.query(
    `
      INSERT INTO users (username, rut, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'ciudadano')
      RETURNING id, username, rut, email, role, created_at
    `,
    [username, rut, email, passwordHash],
  );
  return result.rows[0];
}

export async function findUserByUsernameOrEmail(usernameOrEmail) {
  const result = await pool.query(
    `
      SELECT id, username, rut, email, password_hash, role, created_at
      FROM users
      WHERE username = $1 OR LOWER(email) = LOWER($1)
      LIMIT 1
    `,
    [usernameOrEmail],
  );
  return result.rows[0];
}

export async function findUserById(id) {
  const result = await pool.query(
    `
      SELECT id, username, rut, email, role, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );
  return result.rows[0];
}

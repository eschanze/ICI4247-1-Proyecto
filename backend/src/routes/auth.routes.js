import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.middleware.js';

export const authRouter = Router();

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RUT_PATTERN = /^(\d{7,8})-([\dK])$/;

function createToken(user) {
  // Incluimos solo los datos necesarios para identificar sesión y permisos
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: '8h' },
  );
}

function publicUser(row) {
  // Nunca devolvemos password_hash en respuestas de la API
  return {
    id: row.id,
    username: row.username,
    rut: row.rut,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  };
}

function normalizeRut(value) {
  const cleanRut = String(value || '')
    .trim()
    .replace(/\./g, '')
    .replace(/\s/g, '')
    .toUpperCase();

  if (!cleanRut) return '';
  if (cleanRut.includes('-')) return cleanRut;

  return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
}

function isValidRut(value) {
  const match = RUT_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const [, body, verifier] = match;
  let multiplier = 2;
  let sum = 0;

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedValue = 11 - (sum % 11);
  const expectedVerifier = expectedValue === 11
    ? '0'
    : expectedValue === 10
      ? 'K'
      : String(expectedValue);

  return verifier === expectedVerifier;
}

function validateRegistration(body) {
  const username = String(body.username || '').trim();
  const rut = normalizeRut(body.rut);
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (!username || username.length < 3 || username.length > 50) {
    return { error: 'El nombre de usuario debe tener entre 3 y 50 caracteres' };
  }

  if (!isValidRut(rut)) {
    return { error: 'El RUT no tiene un formato valido' };
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 120) {
    return { error: 'El email no tiene un formato valido' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      error: `La contrasena debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    };
  }

  return { username, rut, email, password };
}

function validateLogin(body) {
  const usernameOrEmail = String(body.usernameOrEmail || '').trim();
  const password = String(body.password || '');

  if (!usernameOrEmail || !password) {
    return { error: 'Usuario/email y contrasena son obligatorios' };
  }

  return { usernameOrEmail, password };
}

authRouter.post('/register', async (req, res, next) => {
  try {
    const input = validateRegistration(req.body);

    if (input.error) {
      return res.status(400).json({
        data: null,
        error: { message: input.error },
      });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    // El registro público siempre crea ciudadanos; los funcionarios se crean de forma controlada
    const result = await pool.query(
      `
        INSERT INTO users (username, rut, email, password_hash, role)
        VALUES ($1, $2, $3, $4, 'ciudadano')
        RETURNING id, username, rut, email, role, created_at
      `,
      [input.username, input.rut, input.email, passwordHash],
    );

    const user = publicUser(result.rows[0]);
    const token = createToken(user);

    return res.status(201).json({
      data: { user, token },
      error: null,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        data: null,
        error: { message: 'El usuario, email o RUT ya existe' },
      });
    }

    return next(error);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const input = validateLogin(req.body);

    if (input.error) {
      return res.status(400).json({
        data: null,
        error: { message: input.error },
      });
    }

    const result = await pool.query(
      `
        SELECT id, username, rut, email, password_hash, role, created_at
        FROM users
        WHERE username = $1 OR LOWER(email) = LOWER($1)
        LIMIT 1
      `,
      [input.usernameOrEmail],
    );

    const row = result.rows[0];
    const passwordMatches = row
      ? await bcrypt.compare(input.password, row.password_hash)
      : false;

    if (!row || !passwordMatches) {
      return res.status(401).json({
        data: null,
        error: { message: 'Credenciales invalidas' },
      });
    }

    const user = publicUser(row);
    const token = createToken(user);

    return res.json({
      data: { user, token },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await pool.query(
      `
        SELECT id, username, rut, email, role, created_at
        FROM users
        WHERE id = $1
        LIMIT 1
      `,
      [req.user.id],
    );

    if (!result.rows[0]) {
      return res.status(404).json({
        data: null,
        error: { message: 'Usuario no encontrado' },
      });
    }

    return res.json({
      data: { user: publicUser(result.rows[0]) },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

import jwt from 'jsonwebtoken';
import { env } from '../../../core/config/env.js';

export function createToken(user) {
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

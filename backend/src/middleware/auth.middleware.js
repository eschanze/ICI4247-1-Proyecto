import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const authHeader = req.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      data: null,
      error: { message: 'Token de autenticacion requerido' },
    });
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtSecret);

    // Guardamos los datos mínimos del token para usarlos en rutas protegidas.
    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      data: null,
      error: { message: 'Token invalido o expirado' },
    });
  }
}

export function requireFuncionario(req, res, next) {
  // Solo los funcionarios pueden ejecutar acciones administrativas.
  if (req.user?.role !== 'funcionario') {
    return res.status(403).json({
      data: null,
      error: { message: 'Permisos de funcionario requeridos' },
    });
  }

  return next();
}

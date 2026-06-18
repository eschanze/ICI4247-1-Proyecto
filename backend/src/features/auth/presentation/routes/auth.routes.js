import bcrypt from 'bcryptjs';
import { Router } from 'express';

import { requireAuth } from '../../../../core/middleware/auth.middleware.js';
import { 
  publicUser, 
  validateRegistration, 
  validateLogin 
} from '../../domain/authValidation.js';
import { createToken } from '../../domain/authToken.js';
import { 
  createUser, 
  findUserByUsernameOrEmail, 
  findUserById 
} from '../../data/authRepository.js';

export const authRouter = Router();

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

    const row = await createUser({
      username: input.username,
      rut: input.rut,
      email: input.email,
      passwordHash,
    });

    const user = publicUser(row);
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

    const row = await findUserByUsernameOrEmail(input.usernameOrEmail);

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
    const row = await findUserById(req.user.id);

    if (!row) {
      return res.status(404).json({
        data: null,
        error: { message: 'Usuario no encontrado' },
      });
    }

    return res.json({
      data: { user: publicUser(row) },
      error: null,
    });
  } catch (error) {
    return next(error);
  }
});

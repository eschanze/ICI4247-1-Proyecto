import dotenv from 'dotenv';

dotenv.config();

// Centralizamos la lectura de variables para no tener que repetir process.env en todo el backend...
export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  databaseUrl:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/no_cables',
  jwtSecret: process.env.JWT_SECRET || 'secreto-local-desarrollo',
};

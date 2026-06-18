import dotenv from 'dotenv';

dotenv.config();

const defaultFrontendOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredFrontendOrigins = [
  process.env.FRONTEND_ORIGIN,
  ...(process.env.FRONTEND_ORIGINS || '').split(','),
]
  .map((origin) => origin?.trim())
  .filter(Boolean);

// Centralizamos la lectura de variables para no tener que repetir process.env en todo el backend...
export const env = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  frontendOrigins: Array.from(new Set([...defaultFrontendOrigins, ...configuredFrontendOrigins])),
  databaseUrl:
    process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/no_cables',
  jwtSecret: process.env.JWT_SECRET || 'secreto-local-desarrollo',
  googleGeocodingApiKey: process.env.GOOGLE_GEOCODING_API_KEY || '',
};

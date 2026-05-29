import pg from 'pg';

import { env } from '../config/env.js';

const { Pool } = pg;

// Usamos un pool para poder reutilizar conexiones a PostgreSQL entre requests
export const pool = new Pool({
  connectionString: env.databaseUrl,
  connectionTimeoutMillis: 2000, // 2 segundos
});

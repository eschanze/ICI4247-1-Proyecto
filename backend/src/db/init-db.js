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

const demoCitizenPassword = 'Ciudadano123';

const demoReports = [
  {
    authorUsername: 'ciudadano1',
    street: 'Av. Florida 6131',
    description: 'Cables colgando a baja altura sobre la vereda. Es un peligro para peatones y ciclistas en la vía.',
    urgency: 'alta',
    status: 'verificado',
    scheduledDate: '2026-05-20',
    createdAt: '2026-04-28T10:15:00.000Z',
    history: [
      {
        status: 'pendiente',
        comment: 'Reporte creado por ciudadano',
        changedByUsername: 'ciudadano1',
        createdAt: '2026-04-28T10:15:00.000Z',
      },
      {
        status: 'verificado',
        comment: 'Verificado en terreno por funcionario Pepito Pérez.',
        changedByUsername: 'funcionario_demo',
        createdAt: '2026-04-30T14:22:00.000Z',
      },
    ],
  },
  {
    authorUsername: 'ciudadano2',
    street: 'Los Pajaritos 245',
    description: 'Cable de telecomunicaciones en desuso apoyado sobre un árbol. Riesgo de caída si hay viento.',
    urgency: 'media',
    status: 'resuelto',
    scheduledDate: '2026-04-02',
    createdAt: '2026-03-12T16:45:00.000Z',
    history: [
      {
        status: 'pendiente',
        comment: 'Reporte creado por ciudadano',
        changedByUsername: 'ciudadano2',
        createdAt: '2026-03-12T16:45:00.000Z',
      },
      {
        status: 'verificado',
        comment: 'Cable corresponde a VTR. Se coordina retiro.',
        changedByUsername: 'funcionario_demo',
        createdAt: '2026-03-14T09:10:00.000Z',
      },
      {
        status: 'agendado',
        comment: 'Retiro agendado para el 02/04.',
        changedByUsername: 'funcionario_demo',
        createdAt: '2026-03-20T11:00:00.000Z',
      },
      {
        status: 'en_proceso',
        comment: null,
        changedByUsername: 'funcionario_demo',
        createdAt: '2026-04-02T08:00:00.000Z',
      },
      {
        status: 'resuelto',
        comment: 'Cable retirado exitosamente. Caso cerrado.',
        changedByUsername: 'funcionario_demo',
        createdAt: '2026-04-02T12:30:00.000Z',
      },
    ],
  },
];

function getRutVerifier(body) {
  let multiplier = 2;
  let sum = 0;

  for (let index = String(body).length - 1; index >= 0; index -= 1) {
    sum += Number(String(body)[index]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }

  const expectedValue = 11 - (sum % 11);
  if (expectedValue === 11) return '0';
  if (expectedValue === 10) return 'K';
  return String(expectedValue);
}

function createDemoCitizen(index) {
  const rutBody = 20000000 + index;

  return {
    username: `ciudadano${index}`,
    rut: `${rutBody}-${getRutVerifier(rutBody)}`,
    email: `ciudadano${index}@nocables.cl`,
    password: demoCitizenPassword,
  };
}

async function getUserIdByUsername(username) {
  const result = await pool.query('SELECT id FROM users WHERE username = $1 LIMIT 1', [username]);
  return result.rows[0]?.id ?? null;
}

async function seedDemoReports() {
  for (const report of demoReports) {
    const authorId = await getUserIdByUsername(report.authorUsername);

    if (!authorId) {
      throw new Error(`No se encontró el usuario demo ${report.authorUsername}`);
    }

    // Guardamos estos casos en la base para que /inicio y el panel partan con datos reales.
    const reportResult = await pool.query(
      `
        INSERT INTO reports (
          user_id,
          street,
          description,
          urgency,
          status,
          scheduled_date,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7)
        RETURNING id
      `,
      [
        authorId,
        report.street,
        report.description,
        report.urgency,
        report.status,
        report.scheduledDate,
        report.createdAt,
      ],
    );

    const reportId = reportResult.rows[0].id;

    for (const entry of report.history) {
      const changedByUserId = await getUserIdByUsername(entry.changedByUsername);

      if (!changedByUserId) {
        throw new Error(`No se encontró el usuario demo ${entry.changedByUsername}`);
      }

      await pool.query(
        `
          INSERT INTO report_status_history (report_id, status, comment, changed_by_user_id, created_at)
          VALUES ($1, $2, $3, $4, $5)
        `,
        [reportId, entry.status, entry.comment, changedByUserId, entry.createdAt],
      );
    }
  }
}

try {
  const schema = await readFile(schemaPath, 'utf8');

  // Ejecutamos schema.sql para crear las tablas iniciales de la EP2
  await pool.query(schema);

  // Reiniciamos los datos demo para partir siempre desde usuarios controlados.
  await pool.query('TRUNCATE TABLE report_status_history, reports, users RESTART IDENTITY CASCADE');

  const demoFuncionarioPasswordHash = await bcrypt.hash(demoFuncionario.password, 10);
  const demoCitizenPasswordHash = await bcrypt.hash(demoCitizenPassword, 10);

  const demoCitizens = Array.from({ length: 30 }, (_, index) => createDemoCitizen(index + 1));

  for (const citizen of demoCitizens) {
    await pool.query(
      `
        INSERT INTO users (username, rut, email, password_hash, role)
        VALUES ($1, $2, $3, $4, 'ciudadano')
      `,
      [
        citizen.username,
        citizen.rut,
        citizen.email,
        demoCitizenPasswordHash,
      ],
    );
  }

  // Cuenta demo de funcionario para cuando el ayudante revise la EP2
  await pool.query(
    `
      INSERT INTO users (username, rut, email, password_hash, role)
      VALUES ($1, $2, $3, $4, 'funcionario')
    `,
    [
      demoFuncionario.username,
      demoFuncionario.rut,
      demoFuncionario.email,
      demoFuncionarioPasswordHash,
    ],
  );

  await seedDemoReports();

  console.log('Base de datos inicializada correctamente.');
  console.log(`Ciudadanos demo disponibles: ${demoCitizens.length} (contrasena: ${demoCitizenPassword})`);
  console.log(`Reportes demo disponibles: ${demoReports.length}`);
  console.log(`Funcionario demo disponible: ${demoFuncionario.username}`);
} catch (error) {
  console.error('No se pudo inicializar la base de datos.');
  console.error(error.message || error.code || error);
  process.exitCode = 1;
} finally {
  await pool.end();
}

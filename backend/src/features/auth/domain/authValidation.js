export const MIN_PASSWORD_LENGTH = 6;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const RUT_PATTERN = /^(\d{7,8})-([\dK])$/;

export function publicUser(row) {
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

export function normalizeRut(value) {
  const cleanRut = String(value || '')
    .trim()
    .replace(/\./g, '')
    .replace(/\s/g, '')
    .toUpperCase();

  if (!cleanRut) return '';
  if (cleanRut.includes('-')) return cleanRut;

  return `${cleanRut.slice(0, -1)}-${cleanRut.slice(-1)}`;
}

export function isValidRut(value) {
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

export function validateRegistration(body) {
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

export function validateLogin(body) {
  const usernameOrEmail = String(body.usernameOrEmail || '').trim();
  const password = String(body.password || '');

  if (!usernameOrEmail || !password) {
    return { error: 'Usuario/email y contrasena son obligatorios' };
  }

  return { usernameOrEmail, password };
}

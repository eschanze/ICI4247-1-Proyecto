const DEFAULT_API_URL = 'http://localhost:5000/api';
const NETWORK_ERROR_MESSAGE = 'No se pudo conectar con el servidor. Si el problema persiste, por favor contacta al soporte.';

// Permitimos configurar la URL desde Vite, pero mantenemos localhost como valor de desarrollo por defecto
const API_URL = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface ApiEnvelope<T> {
  data: T;
  error: { message: string } | null;
}

interface ApiRequestOptions {
  method?: HttpMethod;
  token?: string;
  body?: unknown;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiRequest<T>(
  path: string,
  { method = 'GET', token, body }: ApiRequestOptions = {},
): Promise<T> {
  // La T es un tipo "variable": cada endpoint indica qué forma espera en data
  // Así reutilizamos este fetch para login, reportes, etc.

  // Los headers siempre van a ser iguales, así que los especificamos aquí para no repetirlos en cada endpoint
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Agregamos el token solo si se especifica
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(NETWORK_ERROR_MESSAGE, 0);
  }

  let payload: ApiEnvelope<T>;

  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    const message = response.ok
      ? 'La API devolvió una respuesta inválida.'
      : 'Error al comunicarse con la API.';

    throw new ApiError(message, response.status);
  }

  // El backend siempre responde con { data, error }, así que normalizamos errores aquí
  if (!response.ok || payload.error) {
    throw new ApiError(payload.error?.message ?? 'Error al comunicarse con la API', response.status);
  }

  return payload.data;
}

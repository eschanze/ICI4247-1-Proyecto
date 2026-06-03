const DEFAULT_API_URL = 'http://localhost:5000/api';

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
  // Centralizamos headers y token para no repetir esta lógica en cada módulo de API
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const payload = (await response.json()) as ApiEnvelope<T>;

  // El backend siempre responde con { data, error }, así que normalizamos errores aquí
  if (!response.ok || payload.error) {
    throw new ApiError(payload.error?.message ?? 'Error al comunicarse con la API', response.status);
  }

  return payload.data;
}

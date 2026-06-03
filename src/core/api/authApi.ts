import { apiRequest } from './apiClient';

// Usamos los mismos roles definidos por el backend y el esquema SQL.
export type UserRole = 'ciudadano' | 'funcionario';

export interface ApiUser {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

interface AuthResponse {
  user: ApiUser;
  token: string;
}

interface MeResponse {
  user: ApiUser;
}

export function register(data: {
  username: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  // El registro público crea ciudadanos; los funcionarios se crean de forma controlada en backend.
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: data,
  });
}

export function login(data: {
  usernameOrEmail: string;
  password: string;
}): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: data,
  });
}

export function getMe(token: string): Promise<MeResponse> {
  // Este endpoint permite reconstruir la sesión si ya tenemos un JWT guardado.
  return apiRequest<MeResponse>('/auth/me', { token });
}

import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { ApiUser } from '../api/authApi';
import { getMe, login as loginRequest, register as registerRequest } from '../api/authApi';

const AUTH_TOKEN_KEY = 'no_cables_auth_token';

// Datos mínimos que necesita el backend para iniciar sesión
interface LoginData {
  usernameOrEmail: string;
  password: string;
}

// El registro público crea usuarios ciudadanos; el rol lo define el backend
interface RegisterData {
  username: string;
  rut: string;
  email: string;
  password: string;
}

// Estado y acciones de autenticación que consumen las páginas y la navegación
interface AuthContextValue {
  user: ApiUser | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  // Guardamos el token para mantener la sesión después de recargar la página.
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      // Si no hay token guardado, la app parte como usuario invitado
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Validamos el JWT contra el backend antes de confiar en la sesión local
        const response = await getMe(token);

        if (isMounted) {
          setUser(response.user);
        }
      } catch {
        // Si el token expiró o ya no es válido, limpiamos la sesión local
        localStorage.removeItem(AUTH_TOKEN_KEY);

        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function login(data: LoginData) {
    // El backend valida credenciales y devuelve usuario público + JWT.
    const response = await loginRequest(data);

    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }

  async function register(data: RegisterData) {
    // Después del registro dejamos al ciudadano autenticado inmediatamente.
    const response = await registerRequest(data);

    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    setToken(response.token);
    setUser(response.user);
  }

  function logout() {
    // Cerrar sesión solo requiere borrar el token local y limpiar el estado React.
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  const value = { user, token, isLoading, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }

  return context;
}

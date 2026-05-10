/*
 * DummyAuth.tsx – Autenticación simulada para la entrega parcial 1.
 * Para la EP2 este archivo se reemplazará por un AuthContext real.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';

/* Roles posibles dentro del sistema No+Cables. */
type UserRole = 'ciudadano' | 'funcionario';

/* Datos del usuario autenticado que se exponen al resto de la app. */
export interface DummyUser {
  username: string;
  role: UserRole;
}

/* Forma del contexto que consumen los componentes hijos. */
interface DummyAuthContextValue {
  user: DummyUser | null;                                          // usuario actual o null si no hay sesión activa
  login: (username: string, password: string) => boolean;          // intenta autenticar; retorna true si las credenciales coinciden
  logout: () => void;                                              // cierra la sesión actual
}

/*
 * Lista de credenciales válidas para la demo.
 * En producción esto no existiría: la validación ocurriría en el backend.
 */
const DUMMY_CREDENTIALS: { username: string; password: string; role: UserRole }[] = [
  { username: 'ciudadano', password: 'contra123', role: 'ciudadano' },
  { username: 'admin', password: 'contra123', role: 'funcionario' },
];

/*
 * createContext crea un "canal" de datos que cualquier componente hijo puede leer
 * sin necesidad de pasar props manualmente por cada nivel del árbol.
 * El valor inicial es null porque el Provider real se monta en App.tsx.
 */
const DummyAuthContext = createContext<DummyAuthContextValue | null>(null);

/*
 * DummyAuthProvider envuelve la app y mantiene el estado de sesión.
 * Los componentes hijos acceden al estado via el hook useDummyAuth().
 *
 * ReactNode es el tipo que React usa para "cualquier cosa renderizable"
 * (elementos, strings, arrays, fragments, etc.).
 */
export function DummyAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DummyUser | null>(null);

  /*
   * useCallback memoriza la función para que no se re-cree en cada render.
   * Sin useCallback, cada render generaría una nueva referencia de `login`,
   * lo que podría causar renders innecesarios en componentes que la consuman.
   */
  const login = useCallback((username: string, password: string): boolean => {
    const match = DUMMY_CREDENTIALS.find(
      (cred) => cred.username === username && cred.password === password,
    );

    if (match) {
      setUser({ username: match.username, role: match.role });
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <DummyAuthContext.Provider value={{ user, login, logout }}>
      {children}
    </DummyAuthContext.Provider>
  );
}

// Custom hook para no tener que importar el context y usar useContext manualmente en cada componente
// basta con: const { user, login, logout } = useDummyAuth();
export function useDummyAuth(): DummyAuthContextValue {
  const context = useContext(DummyAuthContext);

  if (!context) {
    throw new Error('useDummyAuth debe usarse dentro de <DummyAuthProvider>');
  }

  return context;
}

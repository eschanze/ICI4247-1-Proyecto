import { IonApp } from '@ionic/react';
import { AuthProvider } from './core/auth/AuthContext';
import { ReportProvider } from './core/data/ReportContext';
import { AppRouter } from './core/router/AppRouter';

/*
 * Componente raíz de la aplicación.
 *
 * Los Providers envuelven al router para que cualquier componente hijo
 * (páginas, header, etc.) pueda acceder a los contextos de autenticación
 * y reportes sin necesidad de pasar props manualmente.
 */
export default function App() {
  return (
    <IonApp>
      <AuthProvider>
        <ReportProvider>
          <AppRouter />
        </ReportProvider>
      </AuthProvider>
    </IonApp>
  );
}

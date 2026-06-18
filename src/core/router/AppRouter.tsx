import { lazy, Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import { IonRouterOutlet, IonSpinner } from '@ionic/react';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import './AppRouter.css';

// Lazy loading de las páginas para reducir el bundle inicial (code splitting)
const LandingPage = lazy(() => import('../../features/landing/presentation/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../../features/login/presentation/LoginPage').then(m => ({ default: m.LoginPage })));
const MapPage = lazy(() => import('../../features/map/presentation/MapPage').then(m => ({ default: m.MapPage })));
const RegisterPage = lazy(() => import('../../features/register/presentation/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ReportPage = lazy(() => import('../../features/report/presentation/ReportPage').then(m => ({ default: m.ReportPage })));
const MyReportsPage = lazy(() => import('../../features/my-reports/presentation/MyReportsPage').then(m => ({ default: m.MyReportsPage })));
const AdminReportsPage = lazy(() => import('../../features/admin-reports/presentation/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));

function LazyFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <IonSpinner />
    </div>
  );
}

export function AppRouter() {
  return (
    <IonReactRouter>
      {/* AppHeader y AppFooter son componentes globales que se muestran en todas las páginas */}
      <AppHeader />
        <IonRouterOutlet className="app-router-outlet">
          {/* 
            Nota: Se decidió volver al patrón de render con un Suspense individual por ruta. 
            Antes estábamos usando component={...} envuelto en un Suspense global, pero 
            IonRouterOutlet cachea las páginas internamente. Eso hacía que 
            los useEffect que cargan datos desde la API no se dispararan de nuevo al navegar 
            (por ejemplo, al redirigir después de hacer login). 
            Con esto nos aseguramos de montar instancias limpias de las vistas cuando corresponde.
          */}
          <Route exact path="/inicio" render={() => <Suspense fallback={<LazyFallback />}><LandingPage /></Suspense>} />
        <Route exact path="/login" render={() => <Suspense fallback={<LazyFallback />}><LoginPage /></Suspense>} />
        <Route exact path="/registro" render={() => <Suspense fallback={<LazyFallback />}><RegisterPage /></Suspense>} />
        <Route exact path="/reportar" render={() => <Suspense fallback={<LazyFallback />}><ReportPage /></Suspense>} />
        <Route exact path="/mis-reportes" render={() => <Suspense fallback={<LazyFallback />}><MyReportsPage /></Suspense>} />
        <Route exact path="/admin-reportes" render={() => <Suspense fallback={<LazyFallback />}><AdminReportsPage /></Suspense>} />
        <Route exact path="/mapa" render={() => <Suspense fallback={<LazyFallback />}><MapPage /></Suspense>} />
        <Route exact path="/">
          <Redirect to="/inicio" />
        </Route>
      </IonRouterOutlet>
      <AppFooter />
    </IonReactRouter>
  );
}

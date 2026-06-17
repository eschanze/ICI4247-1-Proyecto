import { lazy, Suspense } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import { IonRouterOutlet, IonSpinner } from '@ionic/react';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import './AppRouter.css';

// Lazy loading de las páginas para reducir el bundle inicial (code splitting)
const LandingPage = lazy(() => import('../../features/landing/LandingPage').then(m => ({ default: m.LandingPage })));
const LoginPage = lazy(() => import('../../features/login/LoginPage').then(m => ({ default: m.LoginPage })));
const MapPage = lazy(() => import('../../features/map/MapPage').then(m => ({ default: m.MapPage })));
const RegisterPage = lazy(() => import('../../features/register/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ReportPage = lazy(() => import('../../features/report/ReportPage').then(m => ({ default: m.ReportPage })));
const MyReportsPage = lazy(() => import('../../features/my-reports/MyReportsPage').then(m => ({ default: m.MyReportsPage })));
const AdminReportsPage = lazy(() => import('../../features/admin-reports/AdminReportsPage').then(m => ({ default: m.AdminReportsPage })));

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
        {/* Rutas principales de la app */}
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

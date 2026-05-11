import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import { IonRouterOutlet } from '@ionic/react';
import { LandingPage } from '../../features/landing/LandingPage';
import { LoginPage } from '../../features/login/LoginPage';
import { MapPage } from '../../features/map/MapPage';
import { RegisterPage } from '../../features/register/RegisterPage';
import { ReportPage } from '../../features/report/ReportPage';
import { MyReportsPage } from '../../features/my-reports/MyReportsPage';
import { AdminReportsPage } from '../../features/admin-reports/AdminReportsPage';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';
import './AppRouter.css';

export function AppRouter() {
  return (
    <IonReactRouter>
      {/* AppHeader y AppFooter son componentes globales que se muestran en todas las páginas */}
      <AppHeader />
      <IonRouterOutlet className="app-router-outlet">
        {/* Rutas principales de la app */}
        <Route exact path="/inicio" component={LandingPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/registro" component={RegisterPage} />
        <Route exact path="/reportar" component={ReportPage} />
        <Route exact path="/mis-reportes" component={MyReportsPage} />
        <Route exact path="/admin-reportes" component={AdminReportsPage} />
        <Route exact path="/mapa" component={MapPage} />
        <Route exact path="/">
          <Redirect to="/inicio" />
        </Route>
      </IonRouterOutlet>
      <AppFooter />
    </IonReactRouter>
  );
}

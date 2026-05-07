import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import { IonRouterOutlet } from '@ionic/react';
import { LandingPage } from '../../features/landing/LandingPage';
import { LoginPage } from '../../features/login/LoginPage';
import { AppFooter } from '../components/AppFooter';
import { AppHeader } from '../components/AppHeader';

export function AppRouter() {
  return (
    <IonReactRouter>
      {/* AppHeader y AppFooter son componentes globales que se muestran en todas las páginas */}
      <AppHeader />
      <IonRouterOutlet className="app-router-outlet">
        {/* Rutas principales de la app */}
        <Route exact path="/inicio" component={LandingPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/">
          <Redirect to="/inicio" />
        </Route>
      </IonRouterOutlet>
      <AppFooter />
    </IonReactRouter>
  );
}

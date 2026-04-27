import { Redirect, Route } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import { IonRouterOutlet } from '@ionic/react';
import { LandingPage } from '../../features/landing/LandingPage';
import { LoginPage } from '../../features/login/LoginPage';

export function AppRouter() {
  return (
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Las rutas viven en un archivo central para que sea fácil encontrarlas cuando la app crezca. */}
        <Route exact path="/inicio" component={LandingPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/">
          <Redirect to="/inicio" />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
}

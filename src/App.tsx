import { IonApp } from '@ionic/react';
import { AppRouter } from './core/router/AppRouter';

export default function App() {
  return (
    <IonApp>
      <AppRouter />
    </IonApp>
  );
}

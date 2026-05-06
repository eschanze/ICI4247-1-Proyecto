import { useIonViewWillEnter } from '@ionic/react';

export function usePageTitle(title: string) {
  useIonViewWillEnter(() => {
    // Ionic mantiene páginas montadas en el router outlet; este ciclo corre cuando la vista pasa a ser activa.
    document.title = title;
  });
}

import { useIonViewWillEnter } from '@ionic/react';

export function usePageTitle(title: string) {
  useIonViewWillEnter(() => {
    // usar useEffect no funciona bien con Ionic (mantiene páginas montadas en el router outlet)
    // useIonViewWillEnter corre cuando la vista pasa a ser activa
    document.title = title;
  });
}

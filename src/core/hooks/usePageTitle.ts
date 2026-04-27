import { useEffect } from 'react';

export function usePageTitle(title: string) {
  useEffect(() => {
    // Este hook concentra un efecto secundario: cambiar el título del navegador.
    // Separarlo ayuda a reutilizarlo sin repetir la misma lógica en cada página.
    document.title = title;
  }, [title]);
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import App from './App';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import './core/theme/variables.css';

setupIonicReact();

const rootElement = document.getElementById('root');

// React necesita un elemento real del HTML para montar la aplicación.
// TypeScript nos obliga a comprobarlo porque document.getElementById puede devolver null.
if (!rootElement) {
  throw new Error('No se encontró el elemento root para iniciar la aplicación.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

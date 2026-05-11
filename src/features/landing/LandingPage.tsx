import { IonButton, IonContent, IonIcon, IonPage } from '@ionic/react';
import { useDummyAuth } from '../../core/auth/DummyAuth';
import {
  calendarOutline,
  checkmarkDoneOutline,
  clipboardOutline,
  searchOutline,
} from 'ionicons/icons';
import landingBackground from '../../assets/landing_bg.png';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import './LandingPage.css';

// Datos para la sección de estadísticas rápidas en la landing page
// Por ahora son falsos, en la entrega 2 se reemplazarán por datos reales obtenidos del backend
const programStats = [
  { label: 'Reportes activos', value: '2' },
  { label: 'Metros de cable retirados', value: '3.420 m' },
  { label: 'Sectores cubiertos', value: '14' },
  { label: 'Vecinos participantes', value: '870' },
];

// Texto e íconos para cada paso que se muestra en la landing page
const workflowSteps = [
  {
    description: 'Ingresa la ubicación y antecedentes del cable en desuso.',
    icon: clipboardOutline,
    title: 'Reportar',
  },
  {
    description: 'El equipo municipal valida el caso y clasifica su prioridad.',
    icon: searchOutline,
    title: 'Revisar',
  },
  {
    description: 'Se coordina la visita con cuadrillas y empresas responsables.',
    icon: calendarOutline,
    title: 'Agendar',
  },
  {
    description: 'Se retira o regulariza el cableado y se actualiza el reporte.',
    icon: checkmarkDoneOutline,
    title: 'Resolver',
  },
];

export function LandingPage() {
  usePageTitle('Inicio - Programa No+Cables');
  const { user } = useDummyAuth();

  return (
    <IonPage>
      <IonContent className="landing-content">
        <main className="landing-page">
          <section className="landing-hero" aria-labelledby="landing-title">
            <div className="landing-copy">
              <p className="landing-eyebrow">Programa municipal</p>
              <h1 id="landing-title">No+Cables</h1>
              <p className="landing-intro">
                Reporta cables en desuso, ayuda a priorizar sectores y revisa el avance del retiro de cableado en la
                ciudad.
              </p>

              <div className="landing-actions" aria-label="Acciones principales">
                <IonButton className="landing-action-button" size="large" routerLink={user ? "/reportar" : "/registro"}>
                  Reportar cables en desuso
                </IonButton>
                <IonButton
                  className="landing-action-button landing-map-button"
                  size="large"
                  fill="outline"
                  routerLink="/mapa"
                >
                  Ver mapa de reportes
                </IonButton>
              </div>
            </div>

            <figure className="landing-visual-panel" aria-label="Postes y cables sobre la ciudad">
              <img src={landingBackground} alt="" />
            </figure>
          </section>

          <section className="landing-stats-band" aria-label="Indicadores rápidos">
            <div className="landing-stats">
              {programStats.map((stat) => (
                <div className="landing-stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="landing-workflow" aria-labelledby="landing-workflow-title">
            <h2 id="landing-workflow-title">¿Cómo funciona?</h2>

            <div className="landing-steps">
              {workflowSteps.map((step, index) => (
                <article className="landing-step" key={step.title}>
                  <div className="landing-step-icon">
                    <IonIcon icon={step.icon} aria-hidden="true" />
                  </div>
                  <p className="landing-step-number">Paso {index + 1}</p>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
}

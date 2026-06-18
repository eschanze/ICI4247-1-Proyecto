import { env } from '../../../core/config/env.js';

const DEFAULT_COMMUNE_CONTEXT = 'Santo Domingo, Chile';

function buildGeocodingAddress(street) {
  const normalizedStreet = String(street || '').trim();

  if (!normalizedStreet) {
    return '';
  }

  const alreadyHasCommune = /santo domingo/i.test(normalizedStreet);
  return alreadyHasCommune
    ? normalizedStreet
    : `${normalizedStreet}, ${DEFAULT_COMMUNE_CONTEXT}`;
}

export async function geocodeReportStreet(street) {
  const address = buildGeocodingAddress(street);

  if (!env.googleGeocodingApiKey) {
    return { status: 'sin_api_key', latitude: null, longitude: null };
  }

  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', address);
  url.searchParams.set('key', env.googleGeocodingApiKey);

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.results?.[0]?.geometry?.location) {
      return { status: 'fallido', latitude: null, longitude: null };
    }

    const { lat, lng } = data.results[0].geometry.location;

    return {
      status: 'ok',
      latitude: lat,
      longitude: lng,
    };
  } catch {
    // Si Google no responde, igual dejamos crear el reporte y lo marcamos para revisión.
    return { status: 'fallido', latitude: null, longitude: null };
  }
}

import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let isInitialized = false;
let hasConsent = false;

/**
 * Verifica si el usuario ha dado consentimiento para cookies
 */
export const hasUserConsent = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const consent = localStorage.getItem('cookie-consent');
  return consent === 'true';
};

/**
 * Establece el consentimiento del usuario
 */
export const setUserConsent = (consent: boolean): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem('cookie-consent', consent.toString());
  hasConsent = consent;
  
  if (consent && GA_MEASUREMENT_ID && !isInitialized) {
    initGA();
  }
};

/**
 * Inicializa Google Analytics 4
 */
export const initGA = (): void => {
  if (typeof window === 'undefined') return;
  if (!GA_MEASUREMENT_ID) {
    console.warn('Google Analytics Measurement ID no configurado');
    return;
  }
  if (isInitialized) {
    return;
  }
  
  // Solo inicializar si hay consentimiento
  if (!hasUserConsent()) {
    return;
  }
  
  try {
    ReactGA.initialize(GA_MEASUREMENT_ID, {
      testMode: import.meta.env.DEV, // Modo test en desarrollo
    });
    isInitialized = true;
    hasConsent = true;
    
    // Track página inicial
    trackPageView(window.location.pathname);
  } catch (error) {
    console.error('Error inicializando Google Analytics:', error);
  }
};

/**
 * Trackea una vista de página
 */
export const trackPageView = (path: string): void => {
  if (!isInitialized || !hasConsent) return;
  
  try {
    ReactGA.send({ hitType: 'pageview', page: path });
  } catch (error) {
    console.error('Error trackeando page view:', error);
  }
};

/**
 * Trackea un evento personalizado
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isInitialized || !hasConsent) return;
  
  try {
    ReactGA.event({
      action,
      category,
      label,
      value,
    });
  } catch (error) {
    console.error('Error trackeando evento:', error);
  }
};

/**
 * Trackea un evento con parámetros personalizados
 */
export const trackEventWithParams = (
  action: string,
  params?: Record<string, string | number | boolean>
): void => {
  if (!isInitialized || !hasConsent) return;
  
  try {
    ReactGA.event(action, params);
  } catch (error) {
    console.error('Error trackeando evento con parámetros:', error);
  }
};


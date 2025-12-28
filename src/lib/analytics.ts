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
 * Sanitiza un email para solo obtener el dominio (sin PII)
 */
export const sanitizeEmail = (email: string): string => {
  try {
    const parts = email.split('@');
    if (parts.length === 2) {
      return parts[1]; // Retorna solo el dominio
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
};

/**
 * Convierte un monto a un rango para privacidad
 */
export const amountToRange = (amount: number): string => {
  if (amount < 1000) return '0-1k';
  if (amount < 5000) return '1k-5k';
  if (amount < 10000) return '5k-10k';
  if (amount < 25000) return '10k-25k';
  if (amount < 50000) return '25k-50k';
  if (amount < 100000) return '50k-100k';
  if (amount < 250000) return '100k-250k';
  if (amount < 500000) return '250k-500k';
  return '500k+';
};

/**
 * Sanitiza un mensaje de error removiendo información sensible
 */
export const sanitizeErrorMessage = (message: string): string => {
  // Remover emails
  let sanitized = message.replace(/[^\s@]+@[^\s@]+\.[^\s@]+/g, '[email]');
  // Remover números que podrían ser montos
  sanitized = sanitized.replace(/\$\d+/g, '[amount]');
  // Limitar longitud
  return sanitized.substring(0, 200);
};

/**
 * Valida y sanitiza parámetros antes de enviar a GA
 */
export const sanitizeParams = (
  params?: Record<string, string | number | boolean>
): Record<string, string | number | boolean> | undefined => {
  if (!params) return undefined;
  
  const sanitized: Record<string, string | number | boolean> = {};
  
  for (const [key, value] of Object.entries(params)) {
    // Validar que la clave no contenga información sensible
    if (key.toLowerCase().includes('email') || key.toLowerCase().includes('password')) {
      continue; // Omitir parámetros sensibles
    }
    
    // Sanitizar valores de string
    if (typeof value === 'string') {
      // Si parece un email, sanitizarlo
      if (value.includes('@')) {
        sanitized[key] = sanitizeEmail(value);
      } else {
        // Limitar longitud de strings
        sanitized[key] = value.substring(0, 100);
      }
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
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
    const sanitizedParams = sanitizeParams(params);
    
    // Log en modo desarrollo
    if (import.meta.env.DEV) {
      console.log('[GA Event]', action, sanitizedParams);
    }
    
    ReactGA.event(action, sanitizedParams);
  } catch (error) {
    console.error('Error trackeando evento con parámetros:', error);
  }
};


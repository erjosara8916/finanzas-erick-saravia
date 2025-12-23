import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../../lib/analytics';
import { hasUserConsent } from '../../lib/analytics';

/**
 * Componente que trackea automáticamente los cambios de página
 * Debe ser usado dentro de BrowserRouter
 */
export default function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    if (hasUserConsent()) {
      trackPageView(location.pathname + location.search);
    }
  }, [location]);

  return null;
}


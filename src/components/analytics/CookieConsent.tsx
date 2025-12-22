import { useEffect, useState } from 'react';
import { setUserConsent, initGA, hasUserConsent } from '../../lib/analytics';

// Componente interno que puede fallar sin romper la app
function CookieConsentInternal() {
  const [mounted, setMounted] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [CookieConsentLib, setCookieConsentLib] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    
    // Intentar cargar la librería dinámicamente
    import('react-cookie-consent')
      .then((module) => {
        setCookieConsentLib(() => module.default);
      })
      .catch((error) => {
        console.warn('react-cookie-consent no disponible, usando fallback:', error);
        setUseFallback(true);
      });
    
    // Verificar si necesita mostrar el banner
    if (!hasUserConsent()) {
      setShowConsent(true);
    }
    
    // Si ya hay consentimiento previo, inicializar GA
    if (hasUserConsent()) {
      initGA();
    }
  }, []);

  const handleAccept = () => {
    setUserConsent(true);
    initGA();
    setShowConsent(false);
  };

  const handleDecline = () => {
    setUserConsent(false);
    setShowConsent(false);
  };

  if (!mounted || !showConsent) {
    return null;
  }

  // Fallback si la librería no está disponible
  if (useFallback || !CookieConsentLib) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 dark:bg-gray-800 text-white p-4 z-50 shadow-lg border-t border-gray-700">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-gray-300">
            Este sitio utiliza cookies para mejorar la experiencia del usuario y analizar el uso del sitio.{' '}
            <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">Más información</a>
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm border border-gray-600 rounded hover:bg-gray-800 transition-colors"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Aceptar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ConsentComponent = CookieConsentLib;
  return (
    <ConsentComponent
      location="bottom"
      buttonText="Aceptar"
      declineButtonText="Rechazar"
      enableDeclineButton
      cookieName="cookie-consent"
      style={{
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '1rem',
        alignItems: 'center',
        boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.1)',
      }}
      buttonStyle={{
        background: '#3b82f6',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        padding: '0.5rem 1.5rem',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        background: 'transparent',
        color: '#9ca3af',
        fontSize: '14px',
        fontWeight: '500',
        padding: '0.5rem 1.5rem',
        borderRadius: '0.375rem',
        border: '1px solid #4b5563',
        cursor: 'pointer',
        marginRight: '0.5rem',
      }}
      expires={365}
      onAccept={handleAccept}
      onDecline={handleDecline}
    >
      <span className="text-sm text-gray-300">
        Este sitio utiliza cookies para mejorar la experiencia del usuario y analizar el uso del sitio.
        Al continuar navegando, aceptas nuestro uso de cookies.{' '}
        <a
          href="/privacy"
          className="text-blue-400 hover:text-blue-300 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Más información
        </a>
      </span>
    </ConsentComponent>
  );
}

// Componente wrapper que maneja errores
export default function CookieConsentBanner() {
  try {
    return <CookieConsentInternal />;
  } catch (error) {
    console.error('Error en CookieConsent:', error);
    return null;
  }
}

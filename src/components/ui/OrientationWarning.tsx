import { useState, useEffect } from 'react';

export default function OrientationWarning() {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Función para detectar si es un dispositivo móvil
    const checkIsMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth < 768;
    };

    // Función para verificar la orientación
    const checkOrientation = () => {
     /*  const mobile = checkIsMobile();
      setIsMobile(mobile);
      
      if (mobile) {
        // Usar window.orientation o matchMedia para detectar orientación
        const isPortraitMode = 
          window.matchMedia('(orientation: portrait)').matches ||
          (window.orientation === 0 || window.orientation === 180);
        
        setIsPortrait(isPortraitMode);
      } else {
        setIsPortrait(false);
      } */
    };

    // Verificar al montar el componente
    checkOrientation();

    // Escuchar cambios de orientación
    const handleOrientationChange = () => {
      // Pequeño delay para asegurar que la orientación se haya actualizado
      setTimeout(checkOrientation, 100);
    };

    // Escuchar cambios de tamaño de ventana (útil para emuladores y tablets)
    const handleResize = () => {
      checkOrientation();
    };

    // Agregar listeners
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleResize);
    
    // También usar matchMedia para mejor soporte
    const mediaQuery = window.matchMedia('(orientation: portrait)');
    const handleMediaQueryChange = () => {
      checkOrientation();
    };
    
    // Soporte moderno para matchMedia
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleMediaQueryChange);
    } else {
      // Fallback para navegadores antiguos
      mediaQuery.addListener(handleMediaQueryChange);
    }

    // Cleanup
    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleResize);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleMediaQueryChange);
      } else {
        mediaQuery.removeListener(handleMediaQueryChange);
      }
    };
  }, []);

  // Solo mostrar en dispositivos móviles en modo vertical
  if (!isMobile || !isPortrait) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-95 dark:bg-gray-950 dark:bg-opacity-95">
      <div className="text-center px-6 max-w-md mx-auto">
        <div className="mb-6">
          {/* Ícono de rotación */}
          <svg
            className="w-24 h-24 mx-auto text-white animate-pulse"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-4">
          Gira tu dispositivo
        </h2>
        
        <p className="text-lg text-gray-200 mb-2">
          Para obtener una mejor experiencia,
        </p>
        
        <p className="text-lg text-gray-200 font-semibold">
          usa el teléfono en formato horizontal
        </p>
        
        <div className="mt-8">
          <div className="inline-block px-4 py-2 bg-white bg-opacity-20 rounded-lg">
            <p className="text-sm text-gray-300">
              La aplicación se mostrará automáticamente cuando gires el dispositivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}






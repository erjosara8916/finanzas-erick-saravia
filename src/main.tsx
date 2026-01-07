import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import CookieConsentBanner from './components/analytics/CookieConsent.tsx'
import { initGA } from './lib/analytics'
import './index.css'

// Inicializar tema antes de renderizar
const initializeTheme = () => {
  const THEME_STORAGE_KEY = 'metis-finanzas-theme';
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  
  if (savedTheme === 'dark' || savedTheme === 'light') {
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } else {
    // Si no hay tema guardado, usar la preferencia del sistema
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
};

// Inicializar tema inmediatamente para evitar flash
initializeTheme();

// Inicializar GA si hay consentimiento previo (con manejo de errores)
try {
  initGA()
} catch (error) {
  console.warn('Error inicializando GA:', error)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <CookieConsentBanner />
    </BrowserRouter>
  </StrictMode>,
)

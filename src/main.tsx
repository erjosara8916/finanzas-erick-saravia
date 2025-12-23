import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import CookieConsentBanner from './components/analytics/CookieConsent.tsx'
import { initGA } from './lib/analytics'
import './index.css'

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

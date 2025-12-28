import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoanProjectionPage from './pages/LoanProjectionPage';
import ContactPage from './pages/ContactPage';
import FinancialHealthPage from './pages/FinancialHealthPage';
import PageTracker from './components/analytics/PageTracker';
import ErrorBoundary from './components/analytics/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <PageTracker />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/proyeccion-crediticia" element={<LoanProjectionPage />} />
          <Route path="/salud-financiera" element={<FinancialHealthPage />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Routes>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;

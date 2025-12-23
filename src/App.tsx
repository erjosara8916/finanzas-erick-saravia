import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import LandingPage from './pages/LandingPage';
import LoanProjectionPage from './pages/LoanProjectionPage';
import ContactPage from './pages/ContactPage';
import PageTracker from './components/analytics/PageTracker';

function App() {
  return (
    <>
      <PageTracker />
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/proyeccion-crediticia" element={<LoanProjectionPage />} />
          <Route path="/contacto" element={<ContactPage />} />
        </Routes>
      </Layout>
    </>
  );
}

export default App;

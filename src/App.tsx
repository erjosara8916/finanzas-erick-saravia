import { useState, useEffect } from 'react';
import LoanForm from './components/loan/LoanForm';
import ExtraPaymentsManager from './components/loan/ExtraPaymentsManager';
import AmortizationTable from './components/loan/AmortizationTable';
import LoanSummary from './components/loan/LoanSummary';
import Collapsible from './components/ui/Collapsible';
import Stepper from './components/ui/Stepper';
import OrientationWarning from './components/ui/OrientationWarning';
import Button from './components/ui/Button';
import Footer from './components/ui/Footer';
import { useLoanStore } from './store/loanStore';
import { useAnalytics } from './hooks/useAnalytics';

function App() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const { trackPage, trackStepperNavigation } = useAnalytics();
  
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  
  // Determinar si los pasos están completados
  const hasLoanData = !!(loanInput && loanInput.principal && loanInput.annualRate && loanInput.termMonths);
  const hasExtraPayments = Object.keys(extraPayments).length > 0;
  
  // Trackear page view inicial
  useEffect(() => {
    trackPage(window.location.pathname);
  }, [trackPage]);

  // Cuando se abre la configuración por primera vez, establecer el paso activo según los datos
  useEffect(() => {
    if (isConfigOpen && !hasInitialized) {
      if (hasLoanData) {
        setActiveStep(1); // Paso 2 (índice 1)
      } else {
        setActiveStep(0); // Paso 1 (índice 0)
      }
      setHasInitialized(true);
    } else if (!isConfigOpen) {
      // Reset cuando se cierra la configuración
      setHasInitialized(false);
    }
  }, [isConfigOpen, hasLoanData, hasInitialized]);
  
  const steps = [
    {
      label: 'Información del Préstamo',
      completed: hasLoanData,
      active: activeStep === 0,
    },
    {
      label: 'Abonos a Capital',
      completed: hasExtraPayments,
      active: activeStep === 1,
    },
    {
      label: 'Proyección',
      completed: false,
      active: activeStep === 2,
    },
  ];

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex === 2) {
      // Paso 3: Colapsar la configuración
      trackStepperNavigation(stepIndex, steps[stepIndex].label, 'click');
      setIsConfigOpen(false);
    } else {
      trackStepperNavigation(stepIndex, steps[stepIndex].label, 'click');
      setActiveStep(stepIndex);
    }
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      const nextStep = activeStep + 1;
      if (activeStep === steps.length - 2) {
        // Si estamos en el penúltimo paso, al avanzar colapsamos la configuración
        trackStepperNavigation(nextStep, steps[nextStep].label, 'next');
        setIsConfigOpen(false);
      } else {
        trackStepperNavigation(nextStep, steps[nextStep].label, 'next');
        setActiveStep(nextStep);
      }
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      const prevStep = activeStep - 1;
      trackStepperNavigation(prevStep, steps[prevStep].label, 'previous');
      setActiveStep(prevStep);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <OrientationWarning />
      <div className="container mx-auto px-4 py-8 pb-24 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Proyección de pagos para préstamos bancarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Calcula y visualiza tablas de amortización de préstamos con precisión
          </p>
        </header>

        <div className="space-y-6 animate-fade-in">
          <div className="transition-all duration-300">
            <Collapsible 
              title="Configuración" 
              isOpen={isConfigOpen}
              onToggle={setIsConfigOpen}
            >
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Stepper steps={steps} onStepClick={handleStepClick} />
                </div>
                
                <div className="transition-all duration-300">
                  {activeStep === 0 && (
                    <div className="animate-fade-in space-y-4">
                      <LoanForm />
                      <div className="flex justify-end gap-3 pt-4">
                        <Button onClick={handleNext}>
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="animate-fade-in space-y-4">
                      <ExtraPaymentsManager />
                      <div className="flex justify-between gap-3 pt-4">
                        <Button variant="outline" onClick={handlePrevious}>
                          Anterior
                        </Button>
                        <Button onClick={handleNext}>
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div className="animate-fade-in space-y-4">
                      {/* Paso 3 no tiene contenido */}
                      <div className="flex justify-start gap-3 pt-4">
                        <Button variant="outline" onClick={handlePrevious}>
                          Anterior
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Collapsible>
          </div>

          <div className="transition-all duration-300">
            <LoanSummary />
          </div>

          <div className="transition-all duration-300">
            <AmortizationTable />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;

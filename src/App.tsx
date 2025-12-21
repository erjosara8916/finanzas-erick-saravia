import { useState } from 'react';
import LoanForm from './components/loan/LoanForm';
import ExtraPaymentsManager from './components/loan/ExtraPaymentsManager';
import AmortizationTable from './components/loan/AmortizationTable';
import LoanSummary from './components/loan/LoanSummary';
import Collapsible from './components/ui/Collapsible';
import Stepper from './components/ui/Stepper';
import { useLoanStore } from './store/loanStore';

function App() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  
  const [activeStep, setActiveStep] = useState<number>(0);
  
  // Determinar si los pasos están completados
  const hasLoanData = loanInput && loanInput.principal && loanInput.annualRate && loanInput.termMonths;
  const hasExtraPayments = Object.keys(extraPayments).length > 0;
  
  const steps = [
    {
      label: 'Información del Préstamo',
      completed: hasLoanData,
      active: activeStep === 0,
    },
    {
      label: 'Pagos Extraordinarios',
      completed: hasExtraPayments,
      active: activeStep === 1,
    },
  ];

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Motor de Simulación Financiera
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Calcula y visualiza tablas de amortización de préstamos con precisión
          </p>
        </header>

        <div className="space-y-6 animate-fade-in">
          <div className="transition-all duration-300">
            <Collapsible title="Configuración" defaultOpen={true}>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Stepper steps={steps} onStepClick={handleStepClick} />
                </div>
                
                <div className="transition-all duration-300">
                  {activeStep === 0 && (
                    <div className="animate-fade-in">
                      <LoanForm />
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="animate-fade-in">
                      <ExtraPaymentsManager />
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
    </div>
  );
}

export default App;

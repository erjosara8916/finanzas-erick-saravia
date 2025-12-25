import { useState } from 'react';
import TransactionForm from '../components/financial-health/TransactionForm';
import TransactionList from '../components/financial-health/TransactionList';
import TransactionSummary from '../components/financial-health/TransactionSummary';
import HealthGaugeChart from '../components/financial-health/HealthGaugeChart';
import Stepper from '../components/ui/Stepper';
import Button from '../components/ui/Button';

export default function FinancialHealthPage() {
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = [
    {
      label: 'Registro de Transacciones',
      completed: false,
      active: activeStep === 0,
    },
    {
      label: 'Análisis Financiero',
      completed: false,
      active: activeStep === 1,
    },
  ];

  const handleStepClick = (stepIndex: number) => {
    setActiveStep(stepIndex);
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Salud Financiera
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analiza tu estado financiero y calcula tu capacidad de endeudamiento
          </p>
        </header>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} onStepClick={handleStepClick} />
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {activeStep === 0 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left Column: Transaction Form */}
                <div className="transition-all duration-300">
                  <TransactionForm />
                </div>

                {/* Right Column: Transaction List */}
                <div className="transition-all duration-300">
                  <TransactionList />
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-end">
                <Button onClick={() => setActiveStep(1)}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {activeStep === 1 && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Left Column: Transaction Summary */}
                <div className="transition-all duration-300">
                  <TransactionSummary />
                </div>

                {/* Right Column: Gauge Chart */}
                <div className="transition-all duration-300">
                  <HealthGaugeChart />
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(0)}>
                  Anterior
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

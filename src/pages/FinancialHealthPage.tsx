import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TransactionForm from '../components/financial-health/TransactionForm';
import TransactionList from '../components/financial-health/TransactionList';
import TransactionSummary from '../components/financial-health/TransactionSummary';
import HealthGaugeChart from '../components/financial-health/HealthGaugeChart';
import Stepper from '../components/ui/Stepper';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import { useFinancialHealthStore } from '../store/financialHealthStore';
import { AlertCircle } from 'lucide-react';
import type { FinancialTransaction } from '../types/schema';

export default function FinancialHealthPage() {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);
  
  const totalIncome = useFinancialHealthStore((state) => state.totalIncome());
  const hasIncome = totalIncome.gt(0);

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
    if (stepIndex === 1 && !hasIncome) {
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    setActiveStep(stepIndex);
  };

  const handleNextStep = () => {
    if (!hasIncome) {
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    setActiveStep(1);
  };

  // Mostrar diálogo si se accede al paso 2 sin ingresos
  useEffect(() => {
    if (activeStep === 1 && !hasIncome) {
      setShowAlert(true);
    }
  }, [activeStep, hasIncome]);

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
                  <TransactionForm 
                    transactionToEdit={transactionToEdit}
                    onEditComplete={() => setTransactionToEdit(null)}
                  />
                </div>

                {/* Right Column: Transaction List */}
                <div className="transition-all duration-300">
                  <TransactionList 
                    onEditTransaction={(transaction) => setTransactionToEdit(transaction)}
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-end">
                <Button onClick={handleNextStep}>
                  Siguiente
                </Button>
              </div>
            </>
          )}

          {activeStep === 1 && (
            <>
              {!hasIncome ? (
                <div className="p-6 text-center">
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No hay datos disponibles. Por favor, regresa al paso anterior.
                    </p>
                    <Button variant="outline" onClick={() => setActiveStep(0)}>
                      Volver al registro
                    </Button>
                  </div>
              ) : (
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
                    <Link to="/proyeccion-crediticia">
                      <Button variant="primary">
                        Planifica tu crédito
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dialog de alerta */}
      <Dialog
        isOpen={showAlert}
        onClose={() => {
          setShowAlert(false);
          if (activeStep === 1 && !hasIncome) {
            setActiveStep(0);
          }
        }}
        title="Ingresos requeridos"
        className="max-w-md"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {activeStep === 0 
                ? 'Debes agregar al menos un ingreso antes de poder ver el análisis financiero. Por favor, registra tus ingresos en el formulario de arriba.'
                : 'Debes agregar al menos un ingreso antes de poder ver el análisis financiero. Por favor, regresa al paso anterior y registra tus ingresos.'}
            </p>
            <div className="flex justify-end gap-2">
              {activeStep === 1 && !hasIncome && (
                <Button variant="outline" onClick={() => {
                  setShowAlert(false);
                  setActiveStep(0);
                }}>
                  Volver al registro
                </Button>
              )}
              <Button onClick={() => setShowAlert(false)}>
                Entendido
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}

import { useState, useEffect, useMemo } from 'react';
import LoanForm from '../components/loan/LoanForm';
import ExtraPaymentsManager from '../components/loan/ExtraPaymentsManager';
import AmortizationTable from '../components/loan/AmortizationTable';
import LoanSummary from '../components/loan/LoanSummary';
import Collapsible from '../components/ui/Collapsible';
import Stepper from '../components/ui/Stepper';
import OrientationWarning from '../components/ui/OrientationWarning';
import Button from '../components/ui/Button';
import CapacityWarning from '../components/loan/CapacityWarning';
import { useLoanStore } from '../store/loanStore';
import { useFinancialHealthStore } from '../store/financialHealthStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { calculateAmortizationTable } from '../lib/engine';
import { Decimal } from 'decimal.js';
import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';

export default function LoanProjectionPage() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const suggestedPaymentCapacity = useFinancialHealthStore((state) => state.suggestedPaymentCapacity());
  const transactions = useFinancialHealthStore((state) => state.transactions);
  const { trackStepperNavigation } = useAnalytics();
  
  // Verificar si hay datos de salud financiera
  const hasFinancialHealthData = transactions.length > 0;
  
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  
  // Determinar si los pasos están completados
  const hasLoanData = !!(loanInput && loanInput.principal && loanInput.annualRate && loanInput.termMonths);
  const hasExtraPayments = Object.keys(extraPayments).length > 0;

  // Calcular si excede capacidad de pago
  const capacityCheck = useMemo(() => {
    if (!loanInput || !hasLoanData) {
      return { exceeds: false, monthlyPayment: new Decimal(0), averageExtras: new Decimal(0) };
    }

    try {
      const rows = calculateAmortizationTable(loanInput, extraPayments);
      if (rows.length === 0) {
        return { exceeds: false, monthlyPayment: new Decimal(0), averageExtras: new Decimal(0) };
      }

      // Obtener la cuota mensual del primer pago (incluye payment + insurance + fees)
      const firstRow = rows[0];
      const monthlyPayment = new Decimal(firstRow.monthlyPayment);

      // Calcular promedio de abonos extra mensuales
      const extraPaymentsArray = Object.values(extraPayments).map((amount) => new Decimal(amount || 0));
      const totalExtras = extraPaymentsArray.reduce((sum, amount) => sum.plus(amount), new Decimal(0));
      const averageExtras = extraPaymentsArray.length > 0 
        ? totalExtras.div(extraPaymentsArray.length)
        : new Decimal(0);

      // Total mensual estimado (cuota + promedio de abonos)
      const totalMonthly = monthlyPayment.plus(averageExtras);

      // Verificar si excede capacidad (solo si hay datos de salud financiera)
      const hasFinancialHealthData = suggestedPaymentCapacity.gt(0);
      const exceeds = hasFinancialHealthData && totalMonthly.gt(suggestedPaymentCapacity);

      return {
        exceeds,
        monthlyPayment,
        averageExtras,
        totalMonthly,
        suggestedPaymentCapacity,
      };
    } catch (error) {
      console.error('Error calculating capacity check:', error);
      return { exceeds: false, monthlyPayment: new Decimal(0), averageExtras: new Decimal(0) };
    }
  }, [loanInput, extraPayments, suggestedPaymentCapacity, hasLoanData]);

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
    <>
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
          {/* Recommendation Banner */}
          {!hasFinancialHealthData && (
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Recomendación:</strong> Para obtener resultados más precisos y apegarse a la realidad, 
                    te sugerimos usar primero la herramienta{' '}
                    <Link
                      to="/salud-financiera"
                      className="underline font-medium hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      Tu Radiografía Financiera
                    </Link>
                    {' '}para calcular tu capacidad de endeudamiento.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Capacity Warning */}
          {capacityCheck.exceeds && (
            <div className="transition-all duration-300">
              <CapacityWarning />
            </div>
          )}

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
    </>
  );
}


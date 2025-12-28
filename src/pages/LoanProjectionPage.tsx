import { useState, useEffect, useMemo, useRef } from 'react';
import LoanForm from '../components/loan/LoanForm';
import ExtraPaymentsManager from '../components/loan/ExtraPaymentsManager';
import AmortizationTable from '../components/loan/AmortizationTable';
import LoanSummary from '../components/loan/LoanSummary';
import Collapsible from '../components/ui/Collapsible';
import Stepper from '../components/ui/Stepper';
import OrientationWarning from '../components/ui/OrientationWarning';
import Button from '../components/ui/Button';
import Dialog from '../components/ui/Dialog';
import CapacityWarning from '../components/loan/CapacityWarning';
import { useLoanStore } from '../store/loanStore';
import { useFinancialHealthStore } from '../store/financialHealthStore';
import { useAnalytics, useEngagementTracking } from '../hooks/useAnalytics';
import { calculateAmortizationTable } from '../lib/engine';
import { Decimal } from 'decimal.js';
import { Link } from 'react-router-dom';
import { Info, AlertTriangle } from 'lucide-react';
import { amountToRange } from '../lib/analytics';

export default function LoanProjectionPage() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const suggestedPaymentCapacity = useFinancialHealthStore((state) => state.suggestedPaymentCapacity());
  const transactions = useFinancialHealthStore((state) => state.transactions);
  const totalIncome = useFinancialHealthStore((state) => state.totalIncome());
  const totalExpenses = useFinancialHealthStore((state) => state.totalExpenses());
  const { trackStepperNavigation, trackCalculation, trackError } = useAnalytics();
  const calculationTrackedRef = useRef<string>('');
  
  // Tracking de engagement
  useEngagementTracking('loan_projection');
  
  // Verificar si hay datos completos de salud financiera (ingresos y gastos)
  const hasFinancialHealthData = transactions.length > 0 && (totalIncome.gt(0) || totalExpenses.gt(0));
  
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isConfigOpen, setIsConfigOpen] = useState<boolean>(true);
  const [hasInitialized, setHasInitialized] = useState<boolean>(false);
  const [showHealthModal, setShowHealthModal] = useState<boolean>(false);
  const modalShownRef = useRef<boolean>(false);
  const [showCapacityModal, setShowCapacityModal] = useState<boolean>(false);
  const capacityModalShownRef = useRef<boolean>(false);
  
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackError('calculation', errorMessage, 'LoanProjectionPage.capacityCheck', 'capacity_calculation');
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

  // Abrir modal cuando se carga la página y no hay datos de salud financiera
  useEffect(() => {
    if (!hasFinancialHealthData && !modalShownRef.current) {
      setShowHealthModal(true);
      modalShownRef.current = true;
    }
  }, [hasFinancialHealthData]);

  // Abrir modal cuando se detecta que excede la capacidad de pago
  useEffect(() => {
    if (capacityCheck.exceeds && !capacityModalShownRef.current) {
      setShowCapacityModal(true);
      capacityModalShownRef.current = true;
    }
  }, [capacityCheck.exceeds]);

  // Trackear cuando se completa un cálculo
  useEffect(() => {
    if (!hasLoanData || !loanInput) return;
    
    try {
      const rows = calculateAmortizationTable(loanInput, extraPayments);
      if (rows.length === 0) return;
      
      // Crear una clave única para este cálculo
      const calculationKey = `${loanInput.principal}-${loanInput.annualRate}-${loanInput.termMonths}-${Object.keys(extraPayments).length}`;
      
      // Solo trackear si es un cálculo nuevo
      if (calculationTrackedRef.current !== calculationKey) {
        const principal = parseFloat(loanInput.principal || '0');
        const annualRate = parseFloat(loanInput.annualRate || '0');
        const termMonths = loanInput.termMonths || 0;
        const hasExtraPayments = Object.keys(extraPayments).length > 0;
        
        trackCalculation('loan_projection', {
          has_extra_payments: hasExtraPayments,
          loan_amount_range: amountToRange(principal),
          loan_term: termMonths,
          interest_rate: annualRate,
          total_periods: rows.length,
        });
        
        calculationTrackedRef.current = calculationKey;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      trackError('calculation', errorMessage, 'LoanProjectionPage.trackCalculation', 'calculation_tracking');
      console.error('Error calculating for tracking:', error);
    }
  }, [loanInput, extraPayments, hasLoanData, trackCalculation]);
  
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
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 pb-20 sm:pb-24 max-w-7xl">
        <header className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
            Proyección de pagos para préstamos bancarios
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Calcula y visualiza tablas de amortización de préstamos con precisión
          </p>
        </header>

        <div className="space-y-4 sm:space-y-6 animate-fade-in">
          {/* Recommendation Banner */}
          {!hasFinancialHealthData && (
            <div className="p-3 sm:p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-start gap-2 sm:gap-3">
                <Info className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs sm:text-sm text-amber-800 dark:text-amber-200">
                    <strong>Recomendación:</strong> Para hacer un mejor análisis de tu proyección crediticia, 
                    te recomendamos completar la información en la herramienta{' '}
                    <Link
                      to="/salud-financiera"
                      className="underline font-medium hover:text-amber-900 dark:hover:text-amber-100"
                    >
                      Salud Financiera
                    </Link>
                    . Esto te permitirá obtener resultados más precisos y ajustados a tu realidad financiera.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="transition-all duration-300">
            <Collapsible 
              title="Configuración" 
              isOpen={isConfigOpen}
              onToggle={setIsConfigOpen}
            >
              <div className="space-y-4 sm:space-y-6">
                <div className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <Stepper steps={steps} onStepClick={handleStepClick} />
                </div>
                
                <div className="transition-all duration-300">
                  {activeStep === 0 && (
                    <div className="animate-fade-in space-y-3 sm:space-y-4">
                      {/* Capacity Warning */}
                      {capacityCheck.exceeds && (
                        <div className="transition-all duration-300">
                          <CapacityWarning />
                        </div>
                      )}
                      <LoanForm />
                      <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                        <Button onClick={handleNext}>
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="animate-fade-in space-y-3 sm:space-y-4">
                      {/* Capacity Warning */}
                      {capacityCheck.exceeds && (
                        <div className="transition-all duration-300">
                          <CapacityWarning />
                        </div>
                      )}
                      <ExtraPaymentsManager />
                      <div className="flex justify-between gap-2 sm:gap-3 pt-3 sm:pt-4">
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
                    <div className="animate-fade-in space-y-3 sm:space-y-4">
                      {/* Paso 3 no tiene contenido */}
                      <div className="flex justify-start gap-2 sm:gap-3 pt-3 sm:pt-4">
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

      {/* Modal de recomendación de Salud Financiera */}
      <Dialog
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        title="Recomendación"
        className="max-w-md"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
              <strong>Recomendación:</strong> Para hacer un mejor análisis de tu proyección crediticia, 
              te recomendamos completar la información en la herramienta{' '}
              <strong>Salud Financiera</strong>.
              Esto te permitirá obtener resultados más precisos y ajustados a tu realidad financiera.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <Button variant="outline" onClick={() => setShowHealthModal(false)} className="w-full sm:w-auto">
                Continuar
              </Button>
              <Link to="/salud-financiera" onClick={() => setShowHealthModal(false)} className="w-full sm:w-auto">
                <Button variant="cta" className="w-full sm:w-auto">
                  Salud Financiera
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Dialog>

      {/* Modal de Alerta de Capacidad de Pago */}
      <Dialog
        isOpen={showCapacityModal}
        onClose={() => setShowCapacityModal(false)}
        title="Alerta de Capacidad de Pago"
        className="max-w-md"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
              La cuota propuesta más los abonos a capital superan tu capacidad de pago sugerida. 
              Te recomendamos ajustar los valores o revisar tu{' '}
              <Link
                to="/salud-financiera"
                className="underline font-medium hover:text-orange-900 dark:hover:text-orange-100 text-orange-700 dark:text-orange-300"
              >
                salud financiera
              </Link>
              .
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">
              Recuerda que es importante mantener un margen de seguridad en tus finanzas personales.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
              <Button variant="outline" onClick={() => setShowCapacityModal(false)} className="w-full sm:w-auto">
                Entendido
              </Button>
              <Link to="/salud-financiera" onClick={() => setShowCapacityModal(false)} className="w-full sm:w-auto">
                <Button variant="cta" className="w-full sm:w-auto">
                  Revisar Salud Financiera
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}


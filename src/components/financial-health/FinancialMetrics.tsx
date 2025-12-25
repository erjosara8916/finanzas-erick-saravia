import { useFinancialHealthStore } from '../../store/financialHealthStore';
import { formatCurrency } from '../../lib/formatters';
import HealthStatusIndicator from './HealthStatusIndicator';
import { cn } from '../../lib/utils';

export default function FinancialMetrics() {
  const totalIncome = useFinancialHealthStore((state) => state.totalIncome());
  const totalExpenses = useFinancialHealthStore((state) => state.totalExpenses());
  const availableCashFlow = useFinancialHealthStore((state) => state.availableCashFlow());
  const suggestedPaymentCapacity = useFinancialHealthStore((state) => state.suggestedPaymentCapacity());
  const dtiRatio = useFinancialHealthStore((state) => state.dtiRatio());
  const healthStatus = useFinancialHealthStore((state) => state.healthStatus());

  const showCriticalAlert = healthStatus === 'critical';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg z-40">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        {/* Critical Alert Banner */}
        {showCriticalAlert && (
          <div className="mb-4 p-4 rounded-lg bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              ¡Cuidado! Tus gastos actuales consumen la mayor parte de tus ingresos. 
              Solicitar un nuevo préstamo podría poner en riesgo tu estabilidad. 
              Te recomendamos reducir gastos antes de continuar.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Income */}
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Ingresos Totales
            </p>
            <p className="text-xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          {/* Total Expenses */}
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Gastos Totales
            </p>
            <p className="text-xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          {/* Available Cash Flow */}
          <div className="text-center md:text-left">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Flujo de Caja Libre
            </p>
            <p
              className={cn(
                'text-xl font-bold',
                availableCashFlow.gte(0)
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-red-600 dark:text-red-400'
              )}
            >
              {formatCurrency(availableCashFlow)}
            </p>
          </div>

          {/* Health Status */}
          <div className="text-center md:text-left">
            <HealthStatusIndicator status={healthStatus} dtiRatio={dtiRatio} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Capacidad sugerida: {formatCurrency(suggestedPaymentCapacity)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


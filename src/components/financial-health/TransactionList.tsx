import { useFinancialHealthStore } from '../../store/financialHealthStore';
import Card from '../ui/Card';
import { formatCurrency } from '../../lib/formatters';
import { Decimal } from 'decimal.js';
import { Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const incomeCategoryLabels: Record<string, string> = {
  salario_fijo: 'Salario Fijo',
  bonos_comisiones: 'Bonos/Comisiones',
  renta_alquileres: 'Renta/Alquileres',
  otros: 'Otros',
};

const expenseCategoryLabels: Record<string, string> = {
  vivienda: 'Vivienda',
  alimentacion: 'Alimentación',
  transporte: 'Transporte',
  servicios: 'Servicios',
  deudas_existentes: 'Deudas Existentes',
  ocio_vicios: 'Ocio/Vicios',
  educacion: 'Educación',
  otros: 'Otros',
};

export default function TransactionList() {
  const transactions = useFinancialHealthStore((state) => state.transactions);
  const removeTransaction = useFinancialHealthStore((state) => state.removeTransaction);
  
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const getCategoryLabel = (category: string, type: 'income' | 'expense') => {
    if (type === 'income') {
      return incomeCategoryLabels[category] || category;
    }
    return expenseCategoryLabels[category] || category;
  };

  const TransactionItem = ({ 
    transaction 
  }: { 
    transaction: typeof transactions[0] 
  }) => {
    const amount = new Decimal(transaction.amount || 0);
    const isIncome = transaction.type === 'income';

    return (
      <div
        className={cn(
          'p-4 rounded-lg border transition-all hover:shadow-md',
          isIncome
            ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span
                className={cn(
                  'text-lg font-bold',
                  isIncome
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-red-700 dark:text-red-400'
                )}
              >
                {isIncome ? '+' : '-'}
                {formatCurrency(amount)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                • {getCategoryLabel(transaction.category, transaction.type)}
              </span>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {transaction.description}
            </p>
          </div>
          <button
            onClick={() => removeTransaction(transaction.id)}
            className={cn(
              'p-2 rounded-md transition-colors flex-shrink-0',
              'hover:bg-gray-200 dark:hover:bg-gray-700',
              'text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400'
            )}
            aria-label="Eliminar transacción"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Income Column */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Ingresos
        </h3>
        {incomeTransactions.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No hay ingresos registrados
            </p>
          </Card>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {incomeTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>

      {/* Expense Column */}
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Gastos
        </h3>
        {expenseTransactions.length === 0 ? (
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
              No hay gastos registrados
            </p>
          </Card>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
            {expenseTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


import { useState } from 'react';
import { useFinancialHealthStore } from '../../store/financialHealthStore';
import { formatCurrency, formatDateDisplay } from '../../lib/formatters';
import { Decimal } from 'decimal.js';
import Card from '../ui/Card';
import Dialog from '../ui/Dialog';
import Button from '../ui/Button';
import { Eye, Trash2 } from 'lucide-react';
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
};

const getCategoryLabel = (category: string, type: 'income' | 'expense') => {
  if (type === 'income') {
    return incomeCategoryLabels[category] || category;
  }
  return expenseCategoryLabels[category] || category;
};

export default function TransactionTotals() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const transactions = useFinancialHealthStore((state) => state.transactions);
  const totalIncome = useFinancialHealthStore((state) => state.totalIncome());
  const totalExpenses = useFinancialHealthStore((state) => state.totalExpenses());
  const removeTransaction = useFinancialHealthStore((state) => state.removeTransaction);

  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  return (
    <>
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Ingresos Totales */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Ingresos Totales
            </p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalIncome)}
            </p>
          </div>

          {/* Gastos Totales */}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Gastos Totales
            </p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(totalExpenses)}
            </p>
          </div>

          {/* Ver Detalles Button */}
          <div>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(true)}
              className="w-full flex items-center justify-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Ver detalle
            </Button>
          </div>
        </div>
      </Card>

      {/* Details Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Detalle de Transacciones"
        className="max-w-4xl"
      >
        <div className="space-y-6">
          {/* Income Section */}
          {incomeTransactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400 mb-3">
                Ingresos ({incomeTransactions.length})
              </h3>
              <div className="space-y-2">
                {incomeTransactions.map((transaction) => {
                  const amount = new Decimal(transaction.amount || 0);
                  return (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-green-700 dark:text-green-400">
                              +{formatCurrency(amount)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{getCategoryLabel(transaction.category, 'income')}</span>
                            <span>•</span>
                            <span>{formatDateDisplay(transaction.createdAt)}</span>
                          </div>
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
                })}
              </div>
            </div>
          )}

          {/* Expense Section */}
          {expenseTransactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-3">
                Gastos ({expenseTransactions.length})
              </h3>
              <div className="space-y-2">
                {expenseTransactions.map((transaction) => {
                  const amount = new Decimal(transaction.amount || 0);
                  return (
                    <div
                      key={transaction.id}
                      className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg font-bold text-red-700 dark:text-red-400">
                              -{formatCurrency(amount)}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                            {transaction.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span>{getCategoryLabel(transaction.category, 'expense')}</span>
                            <span>•</span>
                            <span>{formatDateDisplay(transaction.createdAt)}</span>
                          </div>
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
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {transactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No hay transacciones registradas
              </p>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
}


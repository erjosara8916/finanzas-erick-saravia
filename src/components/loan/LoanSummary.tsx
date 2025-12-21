import { useMemo } from 'react';
import { useLoanStore } from '../../store/loanStore';
import { calculateAmortizationTable, calculateLoanSummary } from '../../lib/engine';
import { formatCurrency } from '../../lib/formatters';
import Card from '../ui/Card';
import AmortizationChart from '../charts/AmortizationChart';

export default function LoanSummary() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());

  const { rows, summary } = useMemo(() => {
    if (!loanInput || !loanInput.principal || !loanInput.annualRate || !loanInput.termMonths) {
      return { rows: [], summary: null };
    }

    try {
      const calculatedRows = calculateAmortizationTable(loanInput, extraPayments);
      const calculatedSummary = calculateLoanSummary(calculatedRows);
      return { rows: calculatedRows, summary: calculatedSummary };
    } catch (error) {
      console.error('Error calculating summary:', error);
      return { rows: [], summary: null };
    }
  }, [loanInput, extraPayments]);

  if (!summary || rows.length === 0) {
    return (
      <Card title="Loan Summary">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Please fill in the loan details to see the summary
        </p>
      </Card>
    );
  }

  const principal = loanInput ? parseFloat(loanInput.principal || '0') : 0;

  return (
    <div className="space-y-6">
      <Card title="Key Metrics">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total to Pay</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(summary.totalPaid)}
            </p>
          </div>
          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Interest</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {formatCurrency(summary.totalInterest)}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sunk Cost</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalSunkCost)}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Actual Term</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {summary.actualTermMonths} months
            </p>
            {loanInput && summary.actualTermMonths < (loanInput.termMonths || 0) && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {loanInput.termMonths - summary.actualTermMonths} months early
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Amortization Visualization">
        <AmortizationChart rows={rows} />
      </Card>

      <Card title="Cost Breakdown">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Principal</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(principal)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Total Interest</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.totalInterest)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Total Paid</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 pt-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Total Cost (Interest + Fees)
            </span>
            <span className="text-lg font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalSunkCost)}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}


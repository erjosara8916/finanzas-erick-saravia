import { useLoanStore } from '../../store/loanStore';
import { calculateAmortizationTable } from '../../lib/engine';
import { formatCurrency, formatDateDisplay } from '../../lib/formatters';
import Card from '../ui/Card';
import { useMemo } from 'react';

export default function AmortizationTable() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());

  const rows = useMemo(() => {
    if (!loanInput || !loanInput.principal || !loanInput.annualRate || !loanInput.termMonths) {
      return [];
    }

    try {
      return calculateAmortizationTable(loanInput, extraPayments);
    } catch (error) {
      console.error('Error calculating amortization table:', error);
      return [];
    }
  }, [loanInput, extraPayments]);

  if (rows.length === 0) {
    return (
      <Card title="Amortization Table">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Please fill in the loan details to see the amortization table
        </p>
      </Card>
    );
  }

  // Get periods with extra payments for highlighting
  const periodsWithExtras = new Set(
    Object.keys(extraPayments).map((p) => parseInt(p))
  );

  return (
    <Card title="Amortization Table">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Period</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Total Payment</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Interest</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Insurance/Fees</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Principal</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Extra Payment</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Balance</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Accumulated Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const hasExtra = periodsWithExtras.has(row.period);
              // Insurance and fees are constant per period
              const insurance = parseFloat(loanInput?.insuranceAmount || '0');
              const fees = parseFloat(loanInput?.additionalFees || '0');
              const insuranceAndFees = insurance + fees;
              
              return (
                <tr
                  key={row.period}
                  className={`border-b border-gray-100 dark:border-gray-800 ${
                    hasExtra ? 'bg-green-50 dark:bg-green-900/20' : ''
                  } hover:bg-gray-50 dark:hover:bg-gray-800/50`}
                >
                  <td className="p-3 text-gray-900 dark:text-gray-100">{row.period}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-400">
                    {formatDateDisplay(row.paymentDate)}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.monthlyPayment)}
                  </td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.interestComponent)}
                  </td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(insuranceAndFees)}
                  </td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.principalComponent)}
                  </td>
                  <td className={`p-3 text-right font-medium ${
                    row.extraComponent > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'
                  }`}>
                    {row.extraComponent > 0 ? formatCurrency(row.extraComponent) : '-'}
                  </td>
                  <td className="p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.balance)}
                  </td>
                  <td className="p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.sunkCostAccumulated)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}


import { useMemo } from 'react';
import { useLoanStore } from '../../store/loanStore';
import { calculateAmortizationTable, calculateLoanSummary } from '../../lib/engine';
import { formatCurrency, formatMonthsToYearsAndMonths } from '../../lib/formatters';
import { generatePDFReport } from '../../lib/pdfGenerator';
import Card from '../ui/Card';
import AmortizationChart from '../charts/AmortizationChart';
import Tooltip from '../ui/Tooltip';
import Button from '../ui/Button';
import { Download } from 'lucide-react';

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
      <Card title="Resumen del Préstamo">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Por favor completa los detalles del préstamo para ver el resumen
        </p>
      </Card>
    );
  }

  const principal = loanInput ? parseFloat(loanInput.principal || '0') : 0;

  const handleDownloadPDF = () => {
    if (!loanInput || !summary) return;
    generatePDFReport({
      loanInput,
      rows,
      summary,
    });
  };

  return (
    <div className="space-y-6">
      <Card 
        title="Métricas Clave"
        action={
          <Button 
            onClick={handleDownloadPDF}
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total a Pagar</p>
              <Tooltip message="Suma total de todos los pagos realizados durante la vida del préstamo, incluyendo capital, intereses, seguros y cuotas adicionales" />
            </div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(summary.totalPaid)}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Costo total</p>
              <Tooltip message="Costo total del préstamo que incluye todos los intereses pagados más los seguros y cuotas adicionales. Este es el dinero que pagas además del capital principal" />
            </div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(summary.totalSunkCost)}
            </p>
          </div>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="flex items-center gap-1 mb-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Plazo Real</p>
              <Tooltip message="Tiempo real que tomará pagar el préstamo considerando los pagos extra a capital. Si realizas pagos adicionales, el plazo puede ser menor al plazo original" />
            </div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatMonthsToYearsAndMonths(summary.actualTermMonths)}
            </p>
            {loanInput && summary.actualTermMonths < (loanInput.termMonths || 0) && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {formatMonthsToYearsAndMonths(loanInput.termMonths - summary.actualTermMonths)} antes
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card title="Visualización de Amortización">
        <AmortizationChart rows={rows} />
      </Card>

      <Card title="Desglose de Costos">
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Principal</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(principal)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Total Pagado</span>
            <span className="font-semibold text-gray-900 dark:text-gray-100">
              {formatCurrency(summary.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 pt-4">
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Costo Total (Interés + Cuotas)
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


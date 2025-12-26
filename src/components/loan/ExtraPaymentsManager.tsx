import { useState, useMemo } from 'react';
import { useLoanStore } from '../../store/loanStore';
import Button from '../ui/Button';
import InputCurrency from '../ui/InputCurrency';
import Label from '../ui/Label';
import Card from '../ui/Card';
import Select from '../ui/Select';
import Dialog from '../ui/Dialog';
import Tooltip from '../ui/Tooltip';
import { X } from 'lucide-react';
import { validateAmount } from '../../lib/validation';
import { addMonths, parseISO } from 'date-fns';
import { formatDateDisplay, formatCurrency, formatMonthsToYearsAndMonths } from '../../lib/formatters';
import { calculateAmortizationTable, calculateLoanSummary } from '../../lib/engine';
import { useAnalytics } from '../../hooks/useAnalytics';

export default function ExtraPaymentsManager() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const addExtraPayment = useLoanStore((state) => state.addExtraPayment);
  const removeExtraPayment = useLoanStore((state) => state.removeExtraPayment);
  const removeAllExtraPayments = useLoanStore((state) => state.removeAllExtraPayments);
  const { trackExtraPaymentAdded, trackExtraPaymentRemoved } = useAnalytics();

  const [paymentType, setPaymentType] = useState<'single' | 'periodic'>('single');
  const [newPeriod, setNewPeriod] = useState('');
  const [startPeriod, setStartPeriod] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');
  const [isPaymentsDialogOpen, setIsPaymentsDialogOpen] = useState(false);

  // Get existing extra payments sorted by period (before early return)
  const existingPayments = Object.entries(extraPayments)
    .map(([period, amount]) => ({ period: parseInt(period), amount }))
    .sort((a, b) => a.period - b.period);

  // Calcular métricas de ahorro y plazo (before early return)
  const { monthsSaved, savings, costWithoutExtras, costWithExtras, finalizationDate } = useMemo(() => {
    if (!loanInput || !loanInput.principal || !loanInput.annualRate || !loanInput.termMonths) {
      return { monthsSaved: 0, savings: 0, costWithoutExtras: 0, costWithExtras: 0, finalizationDate: null };
    }

    try {
      // Calcular sin abonos
      const rowsWithoutExtras = calculateAmortizationTable(loanInput, {});
      const summaryWithoutExtras = calculateLoanSummary(rowsWithoutExtras);
      const originalTermMonths = loanInput.termMonths || 0;

      // Calcular con abonos
      const rowsWithExtras = calculateAmortizationTable(loanInput, extraPayments);
      const summaryWithExtras = calculateLoanSummary(rowsWithExtras);

      // Calcular meses ahorrados
      const monthsSaved = Math.max(0, originalTermMonths - summaryWithExtras.actualTermMonths);

      // Calcular ahorro (diferencia en costo hundido)
      const savings = Math.max(0, summaryWithoutExtras.totalSunkCost - summaryWithExtras.totalSunkCost);

      // Calcular fecha de finalización
      let finalizationDate: string | null = null;
      try {
        const startDate = parseISO(loanInput.startDate);
        const finalDate = addMonths(startDate, summaryWithExtras.actualTermMonths);
        finalizationDate = formatDateDisplay(finalDate.toISOString().split('T')[0]);
      } catch {
        finalizationDate = null;
      }

      return { 
        monthsSaved, 
        savings, 
        costWithoutExtras: summaryWithoutExtras.totalSunkCost,
        costWithExtras: summaryWithExtras.totalSunkCost,
        finalizationDate
      };
    } catch (error) {
      console.error('Error calculating savings:', error);
      return { monthsSaved: 0, savings: 0, costWithoutExtras: 0, costWithExtras: 0, finalizationDate: null };
    }
  }, [loanInput, extraPayments]);

  if (!loanInput) {
    return null;
  }

  // Calculate max period based on loan term
  const maxPeriod = loanInput.termMonths || 1;
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);
  
  // Helper function to get payment date for a specific period
  const getPaymentDate = (period: number): string => {
    try {
      const startDate = parseISO(loanInput.startDate);
      const paymentDate = addMonths(startDate, period - 1);
      return formatDateDisplay(paymentDate.toISOString().split('T')[0]);
    } catch {
      return '';
    }
  };
  
  // Helper function to format period with date
  const formatPeriodWithDate = (period: number): string => {
    const date = getPaymentDate(period);
    return date ? `Mes ${period} (${date})` : `Mes ${period}`;
  };

  const handleAdd = () => {
    setError('');

    // Validate amount
    const amountValidation = validateAmount(newAmount, false);
    if (!amountValidation.isValid) {
      setError(amountValidation.error || 'Monto inválido');
      return;
    }

    if (paymentType === 'single') {
      // Pago único - comportamiento actual
      const period = parseInt(newPeriod);
      if (!period || period < 1 || period > maxPeriod) {
        setError(`El período debe estar entre 1 y ${maxPeriod}`);
        return;
      }

      if (extraPayments[period]) {
        setError(`El período ${period} ya tiene un abono a capital`);
        return;
      }

      addExtraPayment(period, newAmount);
      trackExtraPaymentAdded(period, parseFloat(newAmount), 'single');
      setNewPeriod('');
      setNewAmount('');
    } else {
      // Pago periódico - nuevo comportamiento
      const start = parseInt(startPeriod);
      const end = parseInt(endPeriod);

      if (!start || start < 1 || start > maxPeriod) {
        setError(`El mes inicio debe estar entre 1 y ${maxPeriod}`);
        return;
      }

      if (!end || end < 1 || end > maxPeriod) {
        setError(`El mes final debe estar entre 1 y ${maxPeriod}`);
        return;
      }

      if (start > end) {
        setError('El mes inicio no puede ser mayor que el mes final');
        return;
      }

      // Verificar si hay conflictos
      const conflictingPeriods: number[] = [];
      for (let period = start; period <= end; period++) {
        if (extraPayments[period]) {
          conflictingPeriods.push(period);
        }
      }

      if (conflictingPeriods.length > 0) {
        setError(`Los períodos ${conflictingPeriods.join(', ')} ya tienen abonos a capital`);
        return;
      }

      // Agregar pagos para todos los períodos en el rango
      const amount = parseFloat(newAmount);
      for (let period = start; period <= end; period++) {
        addExtraPayment(period, newAmount);
        trackExtraPaymentAdded(period, amount, 'periodic');
      }

      setStartPeriod('');
      setEndPeriod('');
      setNewAmount('');
    }
  };

  const handleRemove = (period: number) => {
    removeExtraPayment(period);
    trackExtraPaymentRemoved(period);
  };

  const handleRemoveAll = () => {
    removeAllExtraPayments();
  };

  // Calcular resumen de abonos
  const totalPayments = existingPayments.length;
  const totalAmount = existingPayments.reduce((sum, { amount }) => sum + parseFloat(amount), 0);

  return (
    <Card title="Abonos a Capital" description="Agrega abonos a capital para reducir el principal más rápido">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Columna 1: Formulario */}
        <div className="space-y-3 sm:space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-1">
              <Label htmlFor="payment-type">Tipo de Pago</Label>
              <Tooltip message="Selecciona si deseas hacer un pago extra único en un mes específico, o pagos periódicos durante un rango de meses" />
            </div>
            <Select
              id="payment-type"
              value={paymentType}
              onChange={(e) => {
                setPaymentType(e.target.value as 'single' | 'periodic');
                setError('');
                // Limpiar campos al cambiar el tipo
                setNewPeriod('');
                setStartPeriod('');
                setEndPeriod('');
                setNewAmount('');
              }}
            >
              <option value="single">Pago único</option>
              <option value="periodic">Pago periódico</option>
            </Select>
          </div>

          {paymentType === 'single' ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="extra-period">Período (Mes)</Label>
                  <Tooltip message="Selecciona el mes en el que deseas realizar el pago extra a capital" />
                </div>
              <Select
                id="extra-period"
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
              >
                <option value="">Seleccionar mes</option>
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriodWithDate(p)}
                  </option>
                ))}
              </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="extra-amount">Monto</Label>
                  <Tooltip message="Cantidad adicional que pagarás en este período para reducir el capital del préstamo más rápido" />
                </div>
                <InputCurrency
                  id="extra-amount"
                  value={newAmount}
                  onChange={setNewAmount}
                />
              </div>
              <Button onClick={handleAdd} size="md" className="w-full">
                Agregar
              </Button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="start-period">Mes Inicio</Label>
                  <Tooltip message="Primer mes del rango en el que comenzarás a realizar pagos extra periódicos" />
                </div>
              <Select
                id="start-period"
                value={startPeriod}
                onChange={(e) => setStartPeriod(e.target.value)}
              >
                <option value="">Seleccionar mes</option>
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriodWithDate(p)}
                  </option>
                ))}
              </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="end-period">Mes Final</Label>
                  <Tooltip message="Último mes del rango en el que realizarás pagos extra periódicos" />
                </div>
              <Select
                id="end-period"
                value={endPeriod}
                onChange={(e) => setEndPeriod(e.target.value)}
              >
                <option value="">Seleccionar mes</option>
                {periods.map((p) => (
                  <option key={p} value={p}>
                    {formatPeriodWithDate(p)}
                  </option>
                ))}
              </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="extra-amount">Monto</Label>
                  <Tooltip message="Cantidad que pagarás adicionalmente en cada mes del rango seleccionado para reducir el capital más rápido" />
                </div>
                <InputCurrency
                  id="extra-amount"
                  value={newAmount}
                  onChange={setNewAmount}
                />
              </div>
              <Button onClick={handleAdd} size="md" className="w-full">
                Agregar
              </Button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        {/* Columna 2: Resumen y Listado de abonos a capital */}
        <div className="space-y-3 sm:space-y-4">
          {/* Resumen de abonos */}
          <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
              Resumen de Abonos a Capital
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Cantidad de abonos:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {totalPayments}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total de abonos:</span>
                <span className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Costo total sin abonos:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(costWithoutExtras)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Costo total con abonos:</span>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(costWithExtras)}
                </span>
              </div>
              {finalizationDate && (
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Fecha de finalización:</span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {finalizationDate}
                  </span>
                </div>
              )}
              {monthsSaved > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Finaliza antes:</span>
                  <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatMonthsToYearsAndMonths(monthsSaved)}
                  </span>
                </div>
              )}
              {savings > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Ahorro:</span>
                  <span className="text-xs sm:text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(savings)}
                  </span>
                </div>
              )}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsPaymentsDialogOpen(true)}
                  className="w-full"
                >
                  Ver pagos
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Diálogo de listado de pagos */}
      <Dialog
        isOpen={isPaymentsDialogOpen}
        onClose={() => setIsPaymentsDialogOpen(false)}
        title="Abonos a Capital Programados"
      >
        {existingPayments.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAll}
                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                Eliminar todos
              </Button>
            </div>
            <div className="space-y-2">
              {existingPayments.map(({ period, amount }) => (
                <div
                  key={period}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatPeriodWithDate(period)}:
                    </span>
                    <span className="ml-2 text-gray-600 dark:text-gray-300">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(parseFloat(amount))}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(period)}
                    aria-label={`Eliminar abono a capital del mes ${period}`}
                    className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No hay abonos a capital programados
          </p>
        )}
      </Dialog>
    </Card>
  );
}


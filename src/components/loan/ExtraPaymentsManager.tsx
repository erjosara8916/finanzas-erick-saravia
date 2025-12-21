import { useState } from 'react';
import { useLoanStore } from '../../store/loanStore';
import Button from '../ui/Button';
import InputCurrency from '../ui/InputCurrency';
import Label from '../ui/Label';
import Card from '../ui/Card';
import Select from '../ui/Select';
import { X } from 'lucide-react';
import { validateAmount } from '../../lib/validation';
import { addMonths, parseISO } from 'date-fns';
import { formatDateDisplay } from '../../lib/formatters';

export default function ExtraPaymentsManager() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const addExtraPayment = useLoanStore((state) => state.addExtraPayment);
  const removeExtraPayment = useLoanStore((state) => state.removeExtraPayment);

  const [paymentType, setPaymentType] = useState<'single' | 'periodic'>('single');
  const [newPeriod, setNewPeriod] = useState('');
  const [startPeriod, setStartPeriod] = useState('');
  const [endPeriod, setEndPeriod] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');

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

  // Get existing extra payments sorted by period
  const existingPayments = Object.entries(extraPayments)
    .map(([period, amount]) => ({ period: parseInt(period), amount }))
    .sort((a, b) => a.period - b.period);

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
        setError(`El período ${period} ya tiene un pago extraordinario`);
        return;
      }

      addExtraPayment(period, newAmount);
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
        setError(`Los períodos ${conflictingPeriods.join(', ')} ya tienen pagos extraordinarios`);
        return;
      }

      // Agregar pagos para todos los períodos en el rango
      for (let period = start; period <= end; period++) {
        addExtraPayment(period, newAmount);
      }

      setStartPeriod('');
      setEndPeriod('');
      setNewAmount('');
    }
  };

  const handleRemove = (period: number) => {
    removeExtraPayment(period);
  };

  return (
    <Card title="Pagos Extraordinarios" description="Agrega pagos extraordinarios para reducir el principal más rápido">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna 1: Formulario */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-type">Tipo de Pago</Label>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="extra-period">Período (Mes)</Label>
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
              <div className="space-y-2">
                <Label htmlFor="extra-amount">Monto</Label>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="start-period">Mes Inicio</Label>
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
              <div className="space-y-2">
                <Label htmlFor="end-period">Mes Final</Label>
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
              <div className="space-y-2">
                <Label htmlFor="extra-amount">Monto</Label>
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

        {/* Columna 2: Listado de pagos extraordinarios */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pagos Extraordinarios Programados</Label>
            {existingPayments.length > 0 ? (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
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
                      aria-label={`Eliminar pago extraordinario del mes ${period}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No hay pagos extraordinarios programados
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}


import { useState } from 'react';
import { useLoanStore } from '../../store/loanStore';
import Button from '../ui/Button';
import InputCurrency from '../ui/InputCurrency';
import Label from '../ui/Label';
import Card from '../ui/Card';
import { X } from 'lucide-react';
import { validateAmount } from '../../lib/validation';

export default function ExtraPaymentsManager() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const addExtraPayment = useLoanStore((state) => state.addExtraPayment);
  const removeExtraPayment = useLoanStore((state) => state.removeExtraPayment);

  const [newPeriod, setNewPeriod] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [error, setError] = useState('');

  if (!loanInput) {
    return null;
  }

  // Calculate max period based on loan term
  const maxPeriod = loanInput.termMonths || 1;
  const periods = Array.from({ length: maxPeriod }, (_, i) => i + 1);

  // Get existing extra payments sorted by period
  const existingPayments = Object.entries(extraPayments)
    .map(([period, amount]) => ({ period: parseInt(period), amount }))
    .sort((a, b) => a.period - b.period);

  const handleAdd = () => {
    setError('');

    // Validate period
    const period = parseInt(newPeriod);
    if (!period || period < 1 || period > maxPeriod) {
      setError(`El período debe estar entre 1 y ${maxPeriod}`);
      return;
    }

    if (extraPayments[period]) {
      setError(`El período ${period} ya tiene un pago extraordinario`);
      return;
    }

    // Validate amount
    const amountValidation = validateAmount(newAmount, false);
    if (!amountValidation.isValid) {
      setError(amountValidation.error || 'Monto inválido');
      return;
    }

    addExtraPayment(period, newAmount);
    setNewPeriod('');
    setNewAmount('');
  };

  const handleRemove = (period: number) => {
    removeExtraPayment(period);
  };

  return (
    <Card title="Pagos Extraordinarios" description="Agrega pagos extraordinarios para reducir el principal más rápido">
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="extra-period">Período (Mes)</Label>
            <select
              id="extra-period"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
            >
              <option value="">Seleccionar mes</option>
              {periods.map((p) => (
                <option key={p} value={p}>
                  Mes {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="extra-amount">Monto</Label>
            <InputCurrency
              id="extra-amount"
              value={newAmount}
              onChange={setNewAmount}
            />
          </div>
          <Button onClick={handleAdd} size="md">
            Agregar
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {existingPayments.length > 0 && (
          <div className="space-y-2">
            <Label>Pagos Extraordinarios Programados</Label>
            <div className="space-y-2">
              {existingPayments.map(({ period, amount }) => (
                <div
                  key={period}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-md"
                >
                  <div>
                    <span className="font-medium">Month {period}:</span>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">
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
          </div>
        )}

        {existingPayments.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No hay pagos extraordinarios programados
          </p>
        )}
      </div>
    </Card>
  );
}


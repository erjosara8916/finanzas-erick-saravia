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
      setError(`Period must be between 1 and ${maxPeriod}`);
      return;
    }

    if (extraPayments[period]) {
      setError(`Period ${period} already has an extra payment`);
      return;
    }

    // Validate amount
    const amountValidation = validateAmount(newAmount, false);
    if (!amountValidation.isValid) {
      setError(amountValidation.error || 'Invalid amount');
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
    <Card title="Extra Payments" description="Add extra payments to reduce principal faster">
      <div className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="extra-period">Period (Month)</Label>
            <select
              id="extra-period"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
            >
              <option value="">Select month</option>
              {periods.map((p) => (
                <option key={p} value={p}>
                  Month {p}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="extra-amount">Amount</Label>
            <InputCurrency
              id="extra-amount"
              value={newAmount}
              onChange={setNewAmount}
            />
          </div>
          <Button onClick={handleAdd} size="md">
            Add
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {existingPayments.length > 0 && (
          <div className="space-y-2">
            <Label>Scheduled Extra Payments</Label>
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
                    aria-label={`Remove extra payment for month ${period}`}
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
            No extra payments scheduled
          </p>
        )}
      </div>
    </Card>
  );
}


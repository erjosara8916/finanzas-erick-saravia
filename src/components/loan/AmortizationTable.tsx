import { useLoanStore } from '../../store/loanStore';
import { calculateAmortizationTable } from '../../lib/engine';
import { formatCurrency, formatDateDisplay } from '../../lib/formatters';
import Card from '../ui/Card';
import InputCurrency from '../ui/InputCurrency';
import { useMemo, useState, useEffect } from 'react';
import { Decimal } from 'decimal.js';

export default function AmortizationTable() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const extraPayments = useLoanStore((state) => state.getActiveExtraPayments());
  const addExtraPayment = useLoanStore((state) => state.addExtraPayment);
  const removeExtraPayment = useLoanStore((state) => state.removeExtraPayment);

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
      <Card title="Tabla de Amortización">
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          Por favor completa los detalles del préstamo para ver la tabla de amortización
        </p>
      </Card>
    );
  }

  // Get periods with extra payments for highlighting
  const periodsWithExtras = new Set(
    Object.keys(extraPayments).map((p) => parseInt(p))
  );

  return (
    <Card title="Tabla de Amortización">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Período</th>
              <th className="text-left p-3 font-semibold text-gray-700 dark:text-gray-300">Fecha</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Pago Total</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Interés</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Seguro/Cuotas</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Principal</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Pago Extra</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Saldo</th>
              <th className="text-right p-3 font-semibold text-gray-700 dark:text-gray-300">Costo Acumulado</th>
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
                  <td className="p-3 text-right">
                    <EditableExtraPayment
                      period={row.period}
                      currentValue={row.extraComponent}
                      extraPayments={extraPayments}
                      onUpdate={(amount) => {
                        if (amount && parseFloat(amount) > 0) {
                          addExtraPayment(row.period, amount);
                        } else {
                          removeExtraPayment(row.period);
                        }
                      }}
                    />
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

// Componente para editar el pago extra en la tabla
function EditableExtraPayment({
  period,
  currentValue,
  extraPayments,
  onUpdate,
}: {
  period: number;
  currentValue: number;
  extraPayments: Record<number, string>;
  onUpdate: (amount: string) => void;
}) {
  // Obtener el valor actual del store
  const storedValue = extraPayments[period] || '0';
  const [localValue, setLocalValue] = useState(storedValue);
  const [isEditing, setIsEditing] = useState(false);

  // Sincronizar cuando cambia el valor almacenado externamente (solo si no está editando)
  useEffect(() => {
    if (!isEditing) {
      const currentStoredValue = extraPayments[period] || '0';
      setLocalValue(currentStoredValue);
    }
  }, [extraPayments, period, isEditing]);

  const handleChange = (value: string) => {
    setLocalValue(value);
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    
    // El InputCurrency ya formateó el valor, usar localValue actualizado
    const amount = localValue.trim();
    
    // Validar y actualizar
    try {
      const decimal = new Decimal(amount || '0');
      if (decimal.gt(0)) {
        onUpdate(decimal.toString());
      } else {
        // Si es 0 o vacío, eliminar el pago extra
        onUpdate('0');
      }
    } catch {
      // Si hay error, restaurar el valor almacenado
      const currentStoredValue = extraPayments[period] || '0';
      setLocalValue(currentStoredValue);
    }
  };

  const hasValue = currentValue > 0;

  return (
    <div className="flex justify-end">
      <div className="w-32">
        <InputCurrency
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`text-right text-sm ${
            hasValue ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'
          }`}
        />
      </div>
    </div>
  );
}


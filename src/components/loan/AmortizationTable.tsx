import { useLoanStore } from '../../store/loanStore';
import { calculateAmortizationTable } from '../../lib/engine';
import { formatCurrency, formatDateDisplay } from '../../lib/formatters';
import Card from '../ui/Card';
import InputCurrency from '../ui/InputCurrency';
import Tooltip from '../ui/Tooltip';
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
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  Período
                  <Tooltip message="Número del período de pago. Cada período representa un mes del préstamo" />
                </div>
              </th>
              <th className="text-left p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-1">
                  Fecha
                  <Tooltip message="Fecha en la que se realizará el pago de este período" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Pago Total
                  <Tooltip message="Monto total que se paga en este período, incluyendo cuota base, seguro, cuotas adicionales y pagos extra" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Interés
                  <Tooltip message="Porción del pago que corresponde a intereses calculados sobre el saldo pendiente" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Seguro/Cuotas
                  <Tooltip message="Suma del seguro mensual y las cuotas adicionales que se pagan en cada período" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Principal
                  <Tooltip message="Porción del pago que se aplica directamente a reducir el capital del préstamo" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Pago Extra
                  <Tooltip message="Pago adicional a capital que puedes realizar en este período para reducir el saldo más rápido" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Saldo
                  <Tooltip message="Saldo pendiente del préstamo después de realizar el pago de este período" />
                </div>
              </th>
              <th className="text-right p-2 sm:p-3 font-semibold text-gray-700 dark:text-gray-300">
                <div className="flex items-center justify-end gap-1">
                  Costo Acumulado
                  <Tooltip message="Suma acumulada de todos los costos (intereses, seguros y cuotas adicionales) pagados hasta este período" />
                </div>
              </th>
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
                  <td className="p-2 sm:p-3 text-gray-900 dark:text-gray-100">{row.period}</td>
                  <td className="p-2 sm:p-3 text-gray-600 dark:text-gray-400">
                    {formatDateDisplay(row.paymentDate)}
                  </td>
                  <td className="p-2 sm:p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.monthlyPayment)}
                  </td>
                  <td className="p-2 sm:p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.interestComponent)}
                  </td>
                  <td className="p-2 sm:p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(insuranceAndFees)}
                  </td>
                  <td className="p-2 sm:p-3 text-right text-gray-600 dark:text-gray-400">
                    {formatCurrency(row.principalComponent)}
                  </td>
                  <td className="p-2 sm:p-3 text-right">
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
                  <td className="p-2 sm:p-3 text-right font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(row.balance)}
                  </td>
                  <td className="p-2 sm:p-3 text-right text-gray-600 dark:text-gray-400">
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
      <div className="w-24 sm:w-32">
        <InputCurrency
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`text-right text-xs sm:text-sm ${
            hasValue ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-400'
          }`}
        />
      </div>
    </div>
  );
}


import { useLoanStore } from '../../store/loanStore';
import { useFinancialHealthStore } from '../../store/financialHealthStore';
import { validatePrincipal, validateRate, validateTermMonths, validateDate, validateAmount } from '../../lib/validation';
import { calculateMonthlyPayment } from '../../lib/engine';
import { formatCurrency } from '../../lib/formatters';
import Input from '../ui/Input';
import InputCurrency from '../ui/InputCurrency';
import Label from '../ui/Label';
import Card from '../ui/Card';
import Tooltip from '../ui/Tooltip';
import Switch from '../ui/Switch';
import { useState, useMemo, useEffect } from 'react';
import { Decimal } from 'decimal.js';
import { useAnalytics } from '../../hooks/useAnalytics';

interface LoanFormProps {
  onFieldBlur?: () => void;
}

export default function LoanForm({ onFieldBlur }: LoanFormProps = {}) {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const updateLoanInput = useLoanStore((state) => state.updateLoanInput);
  const suggestedPaymentCapacity = useFinancialHealthStore((state) => state.suggestedPaymentCapacity());
  const { trackFormFieldChange, trackValidationError, trackCalculation } = useAnalytics();
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular cuota mensual cuando hay datos válidos
  const monthlyPayment = useMemo(() => {
    if (!loanInput) return null;
    
    const principal = loanInput.principal ? parseFloat(loanInput.principal) : 0;
    const annualRate = loanInput.annualRate ? parseFloat(loanInput.annualRate.toString()) : 0;
    const termMonths = loanInput.termMonths || 0;

    if (principal > 0 && annualRate >= 0 && termMonths > 0) {
      try {
        const principalDecimal = new Decimal(principal);
        const rateDecimal = new Decimal(annualRate);
        const calculatedPayment = calculateMonthlyPayment(principalDecimal, rateDecimal, termMonths);
        return calculatedPayment.toNumber();
      } catch (error) {
        console.error('Error calculating monthly payment:', error);
        return null;
      }
    }
    
    return null;
  }, [loanInput]);

  // Calcular cuota mensual total (cuota calculada + seguro + cargos adicionales)
  const calculatedTotalMonthlyPayment = useMemo(() => {
    if (monthlyPayment === null) return null;
    
    const insurance = loanInput?.insuranceAmount ? parseFloat(loanInput.insuranceAmount) : 0;
    const fees = loanInput?.additionalFees ? parseFloat(loanInput.additionalFees) : 0;
    
    return monthlyPayment + insurance + fees;
  }, [monthlyPayment, loanInput?.insuranceAmount, loanInput?.additionalFees]);

  // Usar cuota fija si está activada, sino usar la calculada
  const useFixedPayment = loanInput?.useFixedPayment || false;
  const totalMonthlyPayment = useFixedPayment && loanInput?.fixedMonthlyPayment
    ? parseFloat(loanInput.fixedMonthlyPayment) || 0
    : calculatedTotalMonthlyPayment;

  // Trackear cálculo completado cuando hay datos válidos
  useEffect(() => {
    if (monthlyPayment !== null && loanInput?.principal && loanInput?.annualRate && loanInput?.termMonths) {
      trackCalculation('monthly_payment', {
        principal: parseFloat(loanInput.principal),
        annual_rate: parseFloat(loanInput.annualRate.toString()),
        term_months: loanInput.termMonths,
        monthly_payment: monthlyPayment,
      });
    }
  }, [monthlyPayment, loanInput?.principal, loanInput?.annualRate, loanInput?.termMonths, trackCalculation]);

  if (!loanInput) {
    return null;
  }

  const handleChange = (field: keyof typeof loanInput, value: string | number) => {
    updateLoanInput({ [field]: value });
    
    // Trackear cambio en campo
    trackFormFieldChange(field, typeof value === 'number' ? value : value);
    
    // Validate on change
    let validation: { isValid: boolean; error?: string } = { isValid: true };
    
    switch (field) {
      case 'principal':
        validation = validatePrincipal(value as string);
        break;
      case 'annualRate':
        validation = validateRate(value as string);
        break;
      case 'termMonths':
        validation = validateTermMonths(value as number);
        break;
      case 'startDate':
        validation = validateDate(value as string);
        break;
      case 'insuranceAmount':
      case 'additionalFees':
      case 'fixedMonthlyPayment':
        validation = validateAmount(value as string, true);
        break;
    }

    if (validation.isValid) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    } else {
      const errorMessage = validation.error || 'Valor inválido';
      setErrors((prev) => ({
        ...prev,
        [field]: errorMessage,
      }));
      // Trackear error de validación
      trackValidationError(field, errorMessage);
    }
  };

  return (
    <Card title="Detalles del Préstamo" description="Ingresa la información del préstamo para calcular la tabla de amortización">
      {suggestedPaymentCapacity.gt(0) && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-green-800 dark:text-green-200">
              Capacidad de Endeudamiento Sugerida:
            </Label>
            <span className="text-sm font-semibold text-green-900 dark:text-green-100">
              {formatCurrency(suggestedPaymentCapacity.toNumber())}
            </span>
            <Tooltip message="Capacidad de pago mensual sugerida basada en tu información de salud financiera. Esta es una referencia para evaluar si el préstamo se ajusta a tu capacidad de pago" />
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="name" required>
              Nombre del prestamo (alias)
            </Label>
            <Tooltip message="Nombre descriptivo para identificar este préstamo. Útil para comparar diferentes ofertas o condiciones" />
          </div>
          <Input
            id="name"
            value={loanInput.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={onFieldBlur}
            placeholder="ej., Oferta Banco X"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="principal" required>
              Monto Principal
            </Label>
            <Tooltip message="Cantidad total del préstamo que recibes inicialmente. Este es el monto sobre el cual se calcularán los intereses" />
          </div>
          <InputCurrency
            id="principal"
            value={loanInput.principal}
            onChange={(value) => handleChange('principal', value)}
            onBlur={onFieldBlur}
            error={!!errors.principal}
          />
          {errors.principal && (
            <p className="text-sm text-red-500">{errors.principal}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="annualRate" required>
              Tasa de Interés Anual (%)
            </Label>
            <Tooltip message="Porcentaje de interés anual que se aplicará al préstamo. Esta tasa determina cuánto pagarás en intereses durante la vida del préstamo" />
          </div>
          <Input
            id="annualRate"
            type="number"
            step="0.01"
            value={loanInput.annualRate}
            onChange={(e) => handleChange('annualRate', e.target.value)}
            onBlur={onFieldBlur}
            placeholder="12.5"
            error={!!errors.annualRate}
          />
          {errors.annualRate && (
            <p className="text-sm text-red-500">{errors.annualRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="termMonths" required>
              Plazo (Meses)
            </Label>
            <Tooltip message="Número de meses en los que se pagará el préstamo. El plazo determina el monto de cada cuota mensual" />
          </div>
          <Input
            id="termMonths"
            type="number"
            min="1"
            value={loanInput.termMonths || ''}
            onChange={(e) => handleChange('termMonths', parseInt(e.target.value) || 0)}
            onBlur={onFieldBlur}
            placeholder="60"
            error={!!errors.termMonths}
          />
          {errors.termMonths && (
            <p className="text-sm text-red-500">{errors.termMonths}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="monthlyPayment">
              Cuota Mensual Calculada
            </Label>
            <Tooltip message="Monto de la cuota mensual calculada basada en el principal, tasa de interés y plazo. Este es el pago base que se usará en la tabla de amortización (sin incluir seguro ni cuotas adicionales)" />
          </div>
          <Input
            id="monthlyPayment"
            type="text"
            value={monthlyPayment !== null ? formatCurrency(monthlyPayment) : ''}
            readOnly
            disabled
            placeholder={monthlyPayment === null ? 'Completa los campos requeridos' : ''}
            className="bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Label htmlFor="totalMonthlyPayment">
                Cuota Mensual Total
              </Label>
              <Tooltip message={useFixedPayment 
                ? "Monto fijo de la cuota mensual que pagarás cada mes. Todas las cuotas serán iguales a este valor, y el abono a capital se calculará automáticamente"
                : "Monto total de la cuota mensual que incluye la cuota calculada más el seguro mensual y los cargos adicionales. Este es el monto total que pagarás cada mes"} />
            </div>
            <Switch
              checked={useFixedPayment}
              onChange={(e) => {
                const isChecked = e.target.checked;
                updateLoanInput({ useFixedPayment: isChecked });
                trackFormFieldChange('useFixedPayment', isChecked ? 'true' : 'false');
                if (isChecked && !loanInput?.fixedMonthlyPayment && calculatedTotalMonthlyPayment !== null) {
                  // Inicializar con el valor calculado si no hay valor fijo
                  updateLoanInput({ fixedMonthlyPayment: calculatedTotalMonthlyPayment.toString() });
                }
              }}
              label="Cuota fija personalizada"
            />
          </div>
          {useFixedPayment ? (
            <InputCurrency
              id="totalMonthlyPayment"
              value={loanInput.fixedMonthlyPayment || ''}
              onChange={(value) => handleChange('fixedMonthlyPayment', value)}
              onBlur={onFieldBlur}
              error={!!errors.fixedMonthlyPayment}
              className="bg-blue-50 dark:bg-blue-900/20 font-semibold"
            />
          ) : (
            <Input
              id="totalMonthlyPayment"
              type="text"
              value={totalMonthlyPayment !== null ? formatCurrency(totalMonthlyPayment) : ''}
              readOnly
              disabled
              placeholder={totalMonthlyPayment === null ? 'Completa los campos requeridos' : ''}
              className="bg-blue-50 dark:bg-blue-900/20 cursor-not-allowed font-semibold"
            />
          )}
          {errors.fixedMonthlyPayment && (
            <p className="text-sm text-red-500">{errors.fixedMonthlyPayment}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="startDate" required>
              Fecha de Inicio
            </Label>
            <Tooltip message="Fecha en la que comenzará el préstamo. A partir de esta fecha se calcularán las fechas de cada pago mensual" />
          </div>
          <Input
            id="startDate"
            type="date"
            value={loanInput.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            onBlur={onFieldBlur}
            error={!!errors.startDate}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="insuranceAmount">
              Seguro Mensual
            </Label>
            <Tooltip message="Monto fijo que se paga mensualmente por concepto de seguro del préstamo. Este monto se suma a cada cuota" />
          </div>
          <InputCurrency
            id="insuranceAmount"
            value={loanInput.insuranceAmount}
            onChange={(value) => handleChange('insuranceAmount', value)}
            onBlur={onFieldBlur}
            error={!!errors.insuranceAmount}
          />
          {errors.insuranceAmount && (
            <p className="text-sm text-red-500">{errors.insuranceAmount}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1">
            <Label htmlFor="additionalFees">
              Cuotas Mensuales Adicionales
            </Label>
            <Tooltip message="Monto adicional que se paga mensualmente por otros conceptos como administración, mantenimiento u otros cargos. Este monto se suma a cada cuota" />
          </div>
          <InputCurrency
            id="additionalFees"
            value={loanInput.additionalFees}
            onChange={(value) => handleChange('additionalFees', value)}
            onBlur={onFieldBlur}
            error={!!errors.additionalFees}
          />
          {errors.additionalFees && (
            <p className="text-sm text-red-500">{errors.additionalFees}</p>
          )}
        </div>
      </div>
    </Card>
  );
}


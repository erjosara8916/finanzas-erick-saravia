import { useLoanStore } from '../../store/loanStore';
import { validatePrincipal, validateRate, validateTermMonths, validateDate, validateAmount } from '../../lib/validation';
import Input from '../ui/Input';
import InputCurrency from '../ui/InputCurrency';
import Label from '../ui/Label';
import Card from '../ui/Card';
import { useState } from 'react';

export default function LoanForm() {
  const loanInput = useLoanStore((state) => state.getActiveLoanInput());
  const updateLoanInput = useLoanStore((state) => state.updateLoanInput);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!loanInput) {
    return null;
  }

  const handleChange = (field: keyof typeof loanInput, value: string | number) => {
    updateLoanInput({ [field]: value });
    
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
      setErrors((prev) => ({
        ...prev,
        [field]: validation.error || 'Invalid value',
      }));
    }
  };

  return (
    <Card title="Loan Details" description="Enter the loan information to calculate the amortization table">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name" required>
            Scenario Name
          </Label>
          <Input
            id="name"
            value={loanInput.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Bank X Offer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="principal" required>
            Principal Amount
          </Label>
          <InputCurrency
            id="principal"
            value={loanInput.principal}
            onChange={(value) => handleChange('principal', value)}
            error={!!errors.principal}
          />
          {errors.principal && (
            <p className="text-sm text-red-500">{errors.principal}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="annualRate" required>
            Annual Interest Rate (%)
          </Label>
          <Input
            id="annualRate"
            type="number"
            step="0.01"
            value={loanInput.annualRate}
            onChange={(e) => handleChange('annualRate', e.target.value)}
            placeholder="12.5"
            error={!!errors.annualRate}
          />
          {errors.annualRate && (
            <p className="text-sm text-red-500">{errors.annualRate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="termMonths" required>
            Term (Months)
          </Label>
          <Input
            id="termMonths"
            type="number"
            min="1"
            value={loanInput.termMonths || ''}
            onChange={(e) => handleChange('termMonths', parseInt(e.target.value) || 0)}
            placeholder="60"
            error={!!errors.termMonths}
          />
          {errors.termMonths && (
            <p className="text-sm text-red-500">{errors.termMonths}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate" required>
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={loanInput.startDate}
            onChange={(e) => handleChange('startDate', e.target.value)}
            error={!!errors.startDate}
          />
          {errors.startDate && (
            <p className="text-sm text-red-500">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="insuranceAmount">
            Monthly Insurance
          </Label>
          <InputCurrency
            id="insuranceAmount"
            value={loanInput.insuranceAmount}
            onChange={(value) => handleChange('insuranceAmount', value)}
            error={!!errors.insuranceAmount}
          />
          {errors.insuranceAmount && (
            <p className="text-sm text-red-500">{errors.insuranceAmount}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalFees">
            Additional Monthly Fees
          </Label>
          <InputCurrency
            id="additionalFees"
            value={loanInput.additionalFees}
            onChange={(value) => handleChange('additionalFees', value)}
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


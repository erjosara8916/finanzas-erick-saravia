import { InputHTMLAttributes, forwardRef, useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { parseCurrency, formatCurrency } from '../../lib/formatters';
import { Decimal } from 'decimal.js';

export interface InputCurrencyProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

const InputCurrency = forwardRef<HTMLInputElement, InputCurrencyProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      if (value) {
        try {
          const decimal = new Decimal(value);
          if (decimal.gt(0)) {
            setDisplayValue(formatCurrency(decimal).replace('$', '').trim());
          } else {
            setDisplayValue('');
          }
        } catch {
          setDisplayValue(value);
        }
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      
      // Parse and update parent
      const parsed = parseCurrency(inputValue);
      onChange(parsed.toString());
    };

    const handleBlur = () => {
      // Format on blur
      if (displayValue) {
        try {
          const parsed = parseCurrency(displayValue);
          if (parsed.gt(0)) {
            setDisplayValue(formatCurrency(parsed).replace('$', '').trim());
          }
        } catch {
          // Keep current value if parsing fails
        }
      }
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
          $
        </span>
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white pl-8 pr-3 py-2 text-sm',
            'ring-offset-white',
            'placeholder:text-gray-500',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'dark:border-gray-600 dark:bg-gray-800 dark:ring-offset-gray-900 dark:placeholder:text-gray-400',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="0.00"
          type="text"
          inputMode="decimal"
          {...props}
        />
      </div>
    );
  }
);

InputCurrency.displayName = 'InputCurrency';

export default InputCurrency;


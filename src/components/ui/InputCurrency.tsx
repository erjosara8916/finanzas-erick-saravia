import { InputHTMLAttributes, forwardRef, useState, useEffect, useRef } from 'react';
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
    // Initialize display value from prop value
    const getInitialDisplayValue = () => {
      if (value) {
        try {
          const decimal = new Decimal(value);
          if (decimal.gt(0)) {
            return formatCurrency(decimal).replace('$', '').trim();
          }
        } catch {
          return value;
        }
      }
      return '';
    };

    const [displayValue, setDisplayValue] = useState(getInitialDisplayValue);
    const isEditingRef = useRef(false);
    const lastSentValueRef = useRef<string>(value || '');

    // Initialize display value only when value prop changes externally (not during editing)
    useEffect(() => {
      // Only sync if we're not editing and the value changed externally
      if (!isEditingRef.current && value !== lastSentValueRef.current) {
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
        lastSentValueRef.current = value;
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      isEditingRef.current = true;
      setDisplayValue(inputValue);
      
      // Parse and update parent with raw value (no formatting) - but don't trigger re-render
      const parsed = parseCurrency(inputValue);
      const parsedString = parsed.toString();
      lastSentValueRef.current = parsedString;
      onChange(parsedString);
    };

    const handleBlur = () => {
      // Format on blur before marking as not editing
      if (displayValue) {
        try {
          const parsed = parseCurrency(displayValue);
          if (parsed.gt(0)) {
            // Round to 2 decimal places
            const rounded = parsed.toDecimalPlaces(2);
            // Format with 2 decimal places
            const formatted = formatCurrency(rounded).replace('$', '').trim();
            setDisplayValue(formatted);
            // Update parent with formatted value
            const roundedString = rounded.toString();
            lastSentValueRef.current = roundedString;
            onChange(roundedString);
          } else {
            setDisplayValue('');
            lastSentValueRef.current = '0';
            onChange('0');
          }
        } catch {
          // Keep current value if parsing fails
        }
      } else {
        lastSentValueRef.current = '0';
        onChange('0');
      }
      
      // Mark as not editing after formatting
      isEditingRef.current = false;
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
            'dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:ring-offset-gray-900 dark:placeholder:text-gray-300',
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


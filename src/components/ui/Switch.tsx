import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className={cn('flex items-center gap-2 cursor-pointer', className)}>
        <div className="relative inline-flex items-center">
          <input
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 dark:peer-focus:ring-blue-400 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
        </div>
        {label && (
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';

export default Switch;


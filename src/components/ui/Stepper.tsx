import { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';

export interface StepperStep {
  label: string;
  completed?: boolean;
  active?: boolean;
}

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[];
  onStepClick?: (stepIndex: number) => void;
}

export default function Stepper({ steps, onStepClick, className, ...props }: StepperProps) {
  return (
    <div className={cn('flex items-center justify-between', className)} {...props}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className="flex items-center w-full">
              {/* Step circle - clickable */}
              <button
                onClick={() => onStepClick?.(index)}
                className={cn(
                  'flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all cursor-pointer',
                  'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  step.active
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                    : step.completed
                    ? 'border-green-600 bg-green-600 text-white dark:border-green-500 dark:bg-green-500'
                    : 'border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-500',
                  !step.active && !step.completed && 'hover:border-gray-400 dark:hover:border-gray-500'
                )}
                aria-label={`Ir a paso ${index + 1}: ${step.label}`}
              >
                {step.completed ? (
                  <Check className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <span className="text-xs sm:text-sm font-semibold">{index + 1}</span>
                )}
              </button>
              
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-1 sm:mx-2 transition-colors',
                    step.completed
                      ? 'bg-green-600 dark:bg-green-500'
                      : 'bg-gray-300 dark:bg-gray-600'
                  )}
                />
              )}
            </div>
            
            {/* Step label - clickable */}
            <button
              onClick={() => onStepClick?.(index)}
              className={cn(
                'mt-1.5 sm:mt-2 text-xs sm:text-sm font-medium transition-colors cursor-pointer hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded px-1 sm:px-2 py-0.5 sm:py-1',
                step.active
                  ? 'text-blue-600 dark:text-blue-400'
                  : step.completed
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              )}
            >
              {step.label}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}



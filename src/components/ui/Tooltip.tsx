import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  message: string;
  className?: string;
}

export default function Tooltip({ message, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={cn('relative inline-flex items-center', className)}>
      <div
        className="cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        tabIndex={0}
        role="tooltip"
        aria-label={message}
      >
        <HelpCircle className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors" />
      </div>
      {isVisible && (
        <div
          className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-md shadow-lg whitespace-normal max-w-xs bottom-full left-1/2 -translate-x-1/2 mb-2 pointer-events-none"
          style={{ minWidth: '200px' }}
        >
          {message}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
            <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
}


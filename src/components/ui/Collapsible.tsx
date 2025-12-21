import { useState, ReactNode, HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';
import Card from './Card';

export interface CollapsibleProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  children: ReactNode;
}

export default function Collapsible({
  title,
  description,
  defaultOpen = true,
  isOpen: controlledIsOpen,
  onToggle,
  children,
  className,
  ...props
}: CollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  
  const handleToggle = () => {
    const newState = !isOpen;
    if (onToggle) {
      onToggle(newState);
    } else {
      setInternalIsOpen(newState);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)} {...props}>
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>
      
      {isOpen && (
        <div className="px-6 pb-6 border-t border-gray-200 dark:border-gray-800">
          <div className="pt-6">{children}</div>
        </div>
      )}
    </Card>
  );
}


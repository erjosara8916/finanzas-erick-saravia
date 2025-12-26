import { HTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900',
          className
        )}
        {...props}
      >
        {(title || description || action) && (
          <div className="p-4 sm:p-6 pb-3 sm:pb-4">
            <div className="flex items-start justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                {title && (
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    {description}
                  </p>
                )}
              </div>
              {action && (
                <div className="flex-shrink-0">
                  {action}
                </div>
              )}
            </div>
          </div>
        )}
        <div className={title || description || action ? 'px-4 sm:px-6 pb-4 sm:pb-6' : 'p-4 sm:p-6'}>
          {children}
        </div>
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;



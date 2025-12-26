import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

interface CapacityWarningProps {
  className?: string;
}

export default function CapacityWarning({ className }: CapacityWarningProps) {
  return (
    <div
      className={cn(
        'p-3 sm:p-4 rounded-lg border bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
        className
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-xs sm:text-sm font-semibold text-orange-800 dark:text-orange-200 mb-1">
            Alerta de Capacidad de Pago
          </h4>
          <p className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 mb-2 sm:mb-3">
            La cuota propuesta más los abonos a capital superan tu capacidad de pago sugerida. 
            Te recomendamos ajustar los valores o revisar tu{' '}
            <Link
              to="/salud-financiera"
              className="underline font-medium hover:text-orange-900 dark:hover:text-orange-100"
            >
              salud financiera
            </Link>
            .
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Recuerda que es importante mantener un margen de seguridad en tus finanzas personales.
          </p>
        </div>
      </div>
    </div>
  );
}


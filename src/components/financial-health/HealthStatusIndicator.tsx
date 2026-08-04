import { CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { HealthStatus } from '../../types/schema';

interface HealthStatusIndicatorProps {
  status: HealthStatus;
  dtiRatio: number;
  className?: string;
}

const statusConfig = {
  excellent: {
    label: 'Salud Financiera Excelente',
    textColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: CheckCircle2,
  },
  adjusted: {
    label: 'Finanzas Ajustadas',
    textColor: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
    icon: AlertTriangle,
  },
  critical: {
    label: 'Alerta: Capacidad Crítica',
    textColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: AlertOctagon,
  },
};

export default function HealthStatusIndicator({
  status,
  dtiRatio,
  className
}: HealthStatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Icon className={cn('h-5 w-5 flex-shrink-0', config.textColor)} />
      <div className="flex flex-col">
        <span className={cn('text-sm font-semibold', config.textColor)}>
          {config.label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400 font-mono tabular-nums">
          DTI: {dtiRatio.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}


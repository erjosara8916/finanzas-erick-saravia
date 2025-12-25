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
    color: 'bg-green-500',
    textColor: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    icon: '🟢',
  },
  adjusted: {
    label: 'Finanzas Ajustadas',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    icon: '🟡',
  },
  critical: {
    label: 'Alerta: Capacidad Crítica',
    color: 'bg-red-500',
    textColor: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    icon: '🔴',
  },
};

export default function HealthStatusIndicator({ 
  status, 
  dtiRatio, 
  className 
}: HealthStatusIndicatorProps) {
  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-xl">{config.icon}</span>
      <div className="flex flex-col">
        <span className={cn('text-sm font-semibold', config.textColor)}>
          {config.label}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          DTI: {dtiRatio.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}


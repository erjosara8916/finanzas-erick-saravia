import { useFinancialHealthStore } from '../../store/financialHealthStore';
import GaugeChart from 'react-gauge-chart';
import { cn } from '../../lib/utils';

interface GaugeChartProps {
  className?: string;
}

export default function HealthGaugeChart({ className }: GaugeChartProps) {
  const dtiRatio = useFinancialHealthStore((state) => state.dtiRatio());
  const healthStatus = useFinancialHealthStore((state) => state.healthStatus());

  // Normalizar el DTI para el gauge (0-1, donde 1 = 100%)
  // El DTI ratio ya está en porcentaje (ej: 1.6 = 1.6%), así que lo dividimos entre 100
  // Pero limitamos a 100% máximo para el gauge
  const percent = Math.min(Math.max(dtiRatio / 100, 0), 1);

  // Colores para las zonas del gauge
  // Verde (0-50%), Amarillo (50-75%), Rojo (75-100%)
  const colors = ['#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', '#10b981', // 0-50% verde
                  '#eab308', '#eab308', '#eab308', '#eab308', '#eab308', // 50-75% amarillo
                  '#ef4444', '#ef4444', '#ef4444', '#ef4444', '#ef4444']; // 75-100% rojo

  // Color de la aguja según el estado
  const getNeedleColor = () => {
    if (healthStatus === 'excellent') return '#10b981'; // green-500
    if (healthStatus === 'adjusted') return '#eab308'; // yellow-500
    return '#ef4444'; // red-500
  };

  return (
    <div className={cn('w-full', className)}>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        
        <div className="flex flex-col items-center">
          {/* Gauge Chart */}
          <div className="mb-4 w-full max-w-md">
            <GaugeChart
              id="health-gauge-chart"
              nrOfLevels={20}
              percent={percent}
              colors={colors}
              arcWidth={0.3}
              arcPadding={0.02}
              cornerRadius={3}
              needleColor={getNeedleColor()}
              needleBaseColor="#374151"
              textColor="#6b7280"
              hideText={true}
              animate={true}
              animDelay={0}
            />
            <div className="text-center mt-2">
              <div className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Tu gasto corresponde al{' '}
                <span className="text-2xl font-bold" style={{ color: getNeedleColor() }}>
                  {dtiRatio.toFixed(1)}%
                </span>
                {' '}de tu ingreso
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


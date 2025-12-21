import {
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import { useMemo } from 'react';
import type { AmortizationRow } from '../../types/schema';
import { formatCurrency } from '../../lib/formatters';

interface AmortizationChartProps {
  rows: AmortizationRow[];
}

export default function AmortizationChart({ rows }: AmortizationChartProps) {
  const chartData = useMemo(() => {
    let accumulatedPrincipal = 0;
    let accumulatedInterest = 0;

    return rows.map((row) => {
      accumulatedPrincipal += row.principalComponent;
      accumulatedInterest += row.interestComponent;

      return {
        period: row.period,
        principal: accumulatedPrincipal,
        interest: accumulatedInterest,
        balance: row.balance,
      };
    });
  }, [rows]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No data to display
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Período {payload[0].payload.period}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="period"
          label={{ value: 'Período (Meses)', position: 'insideBottom', offset: -5 }}
          stroke="#6b7280"
        />
        <YAxis
          label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft' }}
          stroke="#6b7280"
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area
          type="monotone"
          dataKey="principal"
          stackId="1"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.6}
          name="Capital Amortizado"
        />
        <Area
          type="monotone"
          dataKey="interest"
          stackId="1"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.6}
          name="Interés Pagado"
        />
        <Line
          type="monotone"
          dataKey="balance"
          stroke="#ef4444"
          strokeWidth={2}
          dot={false}
          name="Saldo Restante"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}


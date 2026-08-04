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

function formatYAxisTick(value: number): string {
  if (Math.abs(value) < 1000) {
    return `$${value.toFixed(0)}`;
  }
  return `$${(value / 1000).toFixed(0)}k`;
}

export default function AmortizationChart({ rows }: AmortizationChartProps) {
  const chartData = useMemo(() => {
    let accumulatedPrincipal = 0;

    return rows.map((row) => {
      accumulatedPrincipal += row.principalComponent;
      accumulatedPrincipal += row.extraComponent; // Include extra payments in the accumulated principal

      return {
        period: row.period,
        principal: accumulatedPrincipal,
        sunkCost: row.sunkCostAccumulated,
        balance: row.balance,
      };
    });
  }, [rows]);

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No hay datos para mostrar
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold mb-2 text-gray-900 dark:text-gray-100">
            Período {payload[0].payload.period}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm tabular-nums">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    if (!payload) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-gray-700 dark:text-gray-300">
        {payload.map((entry: any, index: number) => (
          <li key={index} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            {entry.value}
          </li>
        ))}
      </ul>
    );
  };

  const axisTextStyle = { fill: 'var(--chart-axis)', fontFamily: 'Geist, system-ui, sans-serif', fontSize: 12 };

  return (
    <div className="h-64 sm:h-80 lg:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="principalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="sunkCostGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.35} />
              <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
          <XAxis
            dataKey="period"
            label={{ value: 'Período (Meses)', position: 'insideBottom', offset: -5, style: axisTextStyle }}
            stroke="var(--chart-axis)"
            tick={axisTextStyle}
          />
          <YAxis
            label={{ value: 'Monto ($)', angle: -90, position: 'insideLeft', style: axisTextStyle }}
            stroke="var(--chart-axis)"
            tick={axisTextStyle}
            tickFormatter={formatYAxisTick}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Area
            type="monotone"
            dataKey="principal"
            stackId="1"
            stroke="var(--chart-1)"
            fill="url(#principalGradient)"
            name="Capital Amortizado"
          />
          <Area
            type="monotone"
            dataKey="sunkCost"
            stackId="1"
            stroke="var(--chart-3)"
            fill="url(#sunkCostGradient)"
            name="Costo total"
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={false}
            name="Saldo Restante"
          />
      </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}


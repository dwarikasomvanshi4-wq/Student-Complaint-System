'use client';

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '@/components/ui/Card';
import { cn } from '@/lib/utils';

/**
 * Analytics chart widget supporting bar and line chart types.
 * Accepts data in either `{name, value}` or `{month, count}` shape.
 *
 * Requirements: 10.3, 13.3
 *
 * @param {Array<{name?: string, value?: number, month?: string, count?: number}>} data - Chart data
 * @param {string} title - Chart title displayed above the chart
 * @param {'bar'|'line'} [type='bar'] - Chart type
 * @param {string} [color='#4f46e5'] - Color for bars/line
 * @param {string} [className] - Additional CSS classes
 */
export default function AnalyticsChart({
  data = [],
  title,
  type = 'bar',
  color = '#4f46e5',
  className,
}) {
  // Normalise both {name, value} and {month, count} shapes to {name, value}
  const normalised = data.map((d) => ({
    name: d.name ?? d.month ?? '',
    value: d.value ?? d.count ?? 0,
  }));

  const commonProps = {
    data: normalised,
    margin: { top: 4, right: 8, left: -16, bottom: 0 },
  };

  const axisProps = {
    tick: { fontSize: 12, fill: '#64748b' },
    axisLine: false,
    tickLine: false,
  };

  return (
    <Card className={cn('flex flex-col gap-4', className)}>
      {title && (
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      )}

      <ResponsiveContainer width="100%" height={240}>
        {type === 'line' ? (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        ) : (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="name" {...axisProps} />
            <YAxis {...axisProps} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </Card>
  );
}

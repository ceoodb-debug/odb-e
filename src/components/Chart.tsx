"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface ChartDataPoint {
  year: number;
  total: number;
  deposits: number;
  interest: number;
}

interface ChartProps {
  data: ChartDataPoint[];
}

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

export default function Chart({ data }: ChartProps) {
  if (data.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        График роста капитала
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorDeposits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `${v} г.`}
            stroke="#a1a1aa"
            fontSize={12}
          />
          <YAxis
            tickFormatter={formatCurrency}
            stroke="#a1a1aa"
            fontSize={12}
            width={60}
          />
          <Tooltip
            formatter={(value, name) => [
              Number(value).toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }),
              String(name),
            ]}
            labelFormatter={(label) => `Год ${label}`}
            contentStyle={{
              backgroundColor: "#18181b",
              border: "1px solid #3f3f46",
              borderRadius: "0.75rem",
              color: "#fafafa",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="deposits"
            name="Вклад + пополнения"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorDeposits)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="interest"
            name="Начисленные проценты"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorInterest)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

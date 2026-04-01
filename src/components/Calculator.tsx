"use client";

import { useState, useMemo } from "react";
import ResultCard from "./ResultCard";
import Chart, { ChartDataPoint } from "./Chart";

type Frequency = 1 | 4 | 12;

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 12, label: "Ежемесячно" },
  { value: 4, label: "Ежеквартально" },
  { value: 1, label: "Ежегодно" },
];

function formatRub(value: number): string {
  return value.toLocaleString("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  });
}

function calculate(
  principal: number,
  monthlyDeposit: number,
  annualRate: number,
  years: number,
  compoundsPerYear: Frequency
) {
  const r = annualRate / 100;
  const n = compoundsPerYear;
  const periodsTotal = n * years;
  const ratePerPeriod = r / n;

  // deposits per compounding period
  const depositsPerPeriod = monthlyDeposit * (12 / n);

  const chartData: ChartDataPoint[] = [];

  for (let year = 0; year <= years; year++) {
    const periods = n * year;

    // Future value of initial principal
    const fvPrincipal = principal * Math.pow(1 + ratePerPeriod, periods);

    // Future value of periodic deposits (annuity)
    const fvDeposits =
      ratePerPeriod > 0
        ? depositsPerPeriod *
          ((Math.pow(1 + ratePerPeriod, periods) - 1) / ratePerPeriod)
        : depositsPerPeriod * periods;

    const total = fvPrincipal + fvDeposits;
    const totalDeposited = principal + monthlyDeposit * 12 * year;
    const interest = total - totalDeposited;

    chartData.push({
      year,
      total: Math.round(total),
      deposits: Math.round(totalDeposited),
      interest: Math.round(interest),
    });
  }

  const finalPeriods = periodsTotal;
  const fvPrincipal = principal * Math.pow(1 + ratePerPeriod, finalPeriods);
  const fvDeposits =
    ratePerPeriod > 0
      ? depositsPerPeriod *
        ((Math.pow(1 + ratePerPeriod, finalPeriods) - 1) / ratePerPeriod)
      : depositsPerPeriod * finalPeriods;

  const finalTotal = fvPrincipal + fvDeposits;
  const totalDeposited = principal + monthlyDeposit * 12 * years;
  const totalInterest = finalTotal - totalDeposited;

  return {
    finalTotal,
    totalDeposited,
    totalInterest,
    chartData,
  };
}

export default function Calculator() {
  const [principal, setPrincipal] = useState(100000);
  const [monthly, setMonthly] = useState(10000);
  const [rate, setRate] = useState(12);
  const [years, setYears] = useState(10);
  const [frequency, setFrequency] = useState<Frequency>(12);

  const result = useMemo(
    () => calculate(principal, monthly, rate, years, frequency),
    [principal, monthly, rate, years, frequency]
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8">
      {/* Input Form */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Начальная сумма"
            value={principal}
            onChange={setPrincipal}
            suffix="₽"
          />
          <InputField
            label="Ежемесячное пополнение"
            value={monthly}
            onChange={setMonthly}
            suffix="₽"
          />
          <InputField
            label="Годовая ставка"
            value={rate}
            onChange={setRate}
            suffix="%"
            step={0.5}
          />
          <InputField
            label="Срок (лет)"
            value={years}
            onChange={setYears}
            min={1}
            max={50}
          />
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Частота капитализации
            </label>
            <div className="flex gap-2">
              {FREQUENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFrequency(opt.value)}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                    frequency === opt.value
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ResultCard
          label="Итоговая сумма"
          value={formatRub(result.finalTotal)}
          color="text-zinc-900 dark:text-zinc-100"
        />
        <ResultCard
          label="Начисленные проценты"
          value={formatRub(result.totalInterest)}
          color="text-emerald-600 dark:text-emerald-400"
        />
        <ResultCard
          label="Сумма пополнений"
          value={formatRub(result.totalDeposited)}
          color="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Chart */}
      <Chart data={result.chartData} />
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  suffix,
  step = 1,
  min = 0,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-2.5 text-zinc-900 outline-none transition-colors focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

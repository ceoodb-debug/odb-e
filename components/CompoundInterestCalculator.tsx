"use client";

import { useMemo, useState } from "react";

type CompoundFrequency = 1 | 2 | 4 | 12 | 365;

const frequencyOptions: { label: string; value: CompoundFrequency }[] = [
  { label: "Ежегодно", value: 1 },
  { label: "Раз в полгода", value: 2 },
  { label: "Ежеквартально", value: 4 },
  { label: "Ежемесячно", value: 12 },
  { label: "Ежедневно", value: 365 },
];

type YearRow = {
  year: number;
  startBalance: number;
  contributions: number;
  interest: number;
  endBalance: number;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateSchedule(
  principal: number,
  annualRate: number,
  years: number,
  compoundsPerYear: CompoundFrequency,
  monthlyContribution: number
): YearRow[] {
  const rows: YearRow[] = [];
  const periodicRate = annualRate / 100 / compoundsPerYear;
  const periodsPerYear = compoundsPerYear;
  const contributionPerPeriod = (monthlyContribution * 12) / periodsPerYear;

  let balance = principal;

  for (let year = 1; year <= years; year++) {
    const startBalance = balance;
    let yearContributions = 0;
    let yearInterest = 0;

    for (let p = 0; p < periodsPerYear; p++) {
      const interest = balance * periodicRate;
      balance += interest + contributionPerPeriod;
      yearInterest += interest;
      yearContributions += contributionPerPeriod;
    }

    rows.push({
      year,
      startBalance,
      contributions: yearContributions,
      interest: yearInterest,
      endBalance: balance,
    });
  }

  return rows;
}

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState<number>(100000);
  const [annualRate, setAnnualRate] = useState<number>(10);
  const [years, setYears] = useState<number>(10);
  const [frequency, setFrequency] = useState<CompoundFrequency>(12);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(5000);

  const schedule = useMemo(
    () =>
      calculateSchedule(
        principal || 0,
        annualRate || 0,
        Math.max(1, Math.floor(years || 0)),
        frequency,
        monthlyContribution || 0
      ),
    [principal, annualRate, years, frequency, monthlyContribution]
  );

  const summary = useMemo(() => {
    const last = schedule[schedule.length - 1];
    if (!last) {
      return {
        finalBalance: principal,
        totalContributions: 0,
        totalInterest: 0,
      };
    }
    const totalContributions = schedule.reduce(
      (sum, row) => sum + row.contributions,
      0
    );
    const totalInterest = schedule.reduce(
      (sum, row) => sum + row.interest,
      0
    );
    return {
      finalBalance: last.endBalance,
      totalContributions,
      totalInterest,
    };
  }, [schedule, principal]);

  const maxBalance = Math.max(
    ...schedule.map((row) => row.endBalance),
    principal
  );

  return (
    <div className="w-full max-w-5xl">
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Калькулятор сложных процентов
        </h1>
        <p className="mt-2 text-slate-300">
          Посмотрите, как ваши сбережения растут со временем благодаря сложному
          проценту
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section className="rounded-2xl bg-slate-800/60 backdrop-blur border border-slate-700 p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-6 text-slate-100">
            Параметры
          </h2>
          <div className="space-y-5">
            <NumberField
              label="Начальная сумма, $"
              value={principal}
              min={0}
              step={1000}
              onChange={setPrincipal}
            />
            <NumberField
              label="Годовая ставка, %"
              value={annualRate}
              min={0}
              max={100}
              step={0.1}
              onChange={setAnnualRate}
            />
            <NumberField
              label="Срок, лет"
              value={years}
              min={1}
              max={60}
              step={1}
              onChange={setYears}
            />
            <NumberField
              label="Ежемесячное пополнение, $"
              value={monthlyContribution}
              min={0}
              step={500}
              onChange={setMonthlyContribution}
            />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Частота начисления процентов
              </label>
              <select
                value={frequency}
                onChange={(e) =>
                  setFrequency(Number(e.target.value) as CompoundFrequency)
                }
                className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              >
                {frequencyOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              title="Итоговая сумма"
              value={formatCurrency(summary.finalBalance)}
              accent="from-emerald-500 to-teal-500"
            />
            <SummaryCard
              title="Вложено всего"
              value={formatCurrency(principal + summary.totalContributions)}
              accent="from-sky-500 to-indigo-500"
            />
            <SummaryCard
              title="Доход от процентов"
              value={formatCurrency(summary.totalInterest)}
              accent="from-amber-500 to-orange-500"
            />
          </div>

          <div className="rounded-2xl bg-slate-800/60 backdrop-blur border border-slate-700 p-6 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-slate-100">
              Рост капитала по годам
            </h2>
            <div className="max-h-[420px] overflow-y-auto pr-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-800/90 backdrop-blur text-slate-300 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2 px-2 text-left font-medium">Год</th>
                    <th className="py-2 px-2 text-right font-medium">
                      Проценты
                    </th>
                    <th className="py-2 px-2 text-right font-medium">
                      Пополнения
                    </th>
                    <th className="py-2 px-2 text-right font-medium">
                      Баланс
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((row) => {
                    const widthPercent = maxBalance
                      ? (row.endBalance / maxBalance) * 100
                      : 0;
                    return (
                      <tr
                        key={row.year}
                        className="border-t border-slate-700/60 hover:bg-slate-700/30 transition-colors"
                      >
                        <td className="py-2 px-2 text-slate-200">
                          {row.year}
                        </td>
                        <td className="py-2 px-2 text-right text-amber-300">
                          {formatCurrency(row.interest)}
                        </td>
                        <td className="py-2 px-2 text-right text-sky-300">
                          {formatCurrency(row.contributions)}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-semibold text-emerald-300">
                              {formatCurrency(row.endBalance)}
                            </span>
                            <div className="h-1 w-28 rounded bg-slate-700 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400"
                                style={{ width: `${widthPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        Формула: A = P·(1 + r/n)<sup>n·t</sup> + PMT·[((1 + r/n)<sup>n·t</sup> −
        1) / (r/n)]
      </footer>
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        min={min}
        max={max}
        step={step}
        onChange={(e) => {
          const parsed = Number(e.target.value);
          onChange(Number.isFinite(parsed) ? parsed : 0);
        }}
        className="w-full rounded-lg border border-slate-600 bg-slate-900/70 px-3 py-2 text-slate-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
      />
    </div>
  );
}

function SummaryCard({
  title,
  value,
  accent,
}: {
  title: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-700 bg-slate-800/60 backdrop-blur p-5 shadow-xl">
      <div
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`}
      />
      <p className="text-xs uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-50">
        {value}
      </p>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  SafeToSpendMetrics, 
  UserProfile, 
  IncomeSource, 
  FixedCost, 
  SavingsGoal, 
  ExpenseItem 
} from '../types';
import { formatZar, formatDateShort } from '../utils/calculations';
import { Wallet, Calendar, ShieldCheck, ChevronDown, ChevronUp, AlertCircle, TrendingUp } from 'lucide-react';

interface SafeToSpendCardProps {
  metrics: SafeToSpendMetrics;
  user: UserProfile;
  incomes: IncomeSource[];
  fixedCosts: FixedCost[];
  savingsGoals: SavingsGoal[];
  todayExpenses: ExpenseItem[];
  theme: 'dark' | 'light';
  onQuickLog: () => void;
}

export const SafeToSpendCard: React.FC<SafeToSpendCardProps> = ({
  metrics,
  user,
  fixedCosts,
  savingsGoals,
  todayExpenses,
  theme,
  onQuickLog,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const isDark = theme === 'dark';

  const todaySpent = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingToday = Math.max(0, metrics.dailySafeToSpend - todaySpent);
  const percentTodaySpent = metrics.dailySafeToSpend > 0 
    ? Math.min(100, Math.round((todaySpent / metrics.dailySafeToSpend) * 100))
    : 100;

  const unpaidCosts = fixedCosts
    .filter((fc) => !fc.isPaid && fc.dueDate <= metrics.nextPaydayDate)
    .reduce((sum, fc) => sum + fc.amount, 0);

  const isOverToday = todaySpent > metrics.dailySafeToSpend && metrics.dailySafeToSpend > 0;

  return (
    <div
      className={`rounded-3xl p-5 shadow-lg border transition-all duration-200 ${
        isDark
          ? 'bg-gradient-to-b from-slate-900 to-slate-900/90 border-slate-800 text-white shadow-emerald-950/20'
          : 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-100/80 text-slate-900 shadow-emerald-500/5'
      }`}
    >
      {/* Top Tag & Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Daily Safe-To-Spend
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-full">
          <Calendar className="w-3 h-3 text-emerald-500" />
          <span>
            {metrics.daysUntilNextPayday} {metrics.daysUntilNextPayday === 1 ? 'day' : 'days'} left
          </span>
        </div>
      </div>

      {/* Flagship Big Number Display */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white font-mono">
          {formatZar(metrics.dailySafeToSpend, false)}
        </span>
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          / day
        </span>
      </div>

      {/* Target Payday Note */}
      <p className="text-xs text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
        Spend up to this daily to reach your{' '}
        <span className="font-bold text-emerald-600 dark:text-emerald-400">
          {metrics.nextPaydaySource}
        </span>{' '}
        on {formatDateShort(metrics.nextPaydayDate)} comfortably.
      </p>

      {/* Today's Live Spending Meter */}
      <div
        className={`p-3.5 rounded-2xl mb-4 border ${
          isDark ? 'bg-slate-800/60 border-slate-750' : 'bg-slate-50 border-slate-100'
        }`}
      >
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-600 dark:text-slate-300">
            Today's spent: <strong className="text-slate-900 dark:text-white">{formatZar(todaySpent)}</strong>
          </span>
          <span className={isOverToday ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
            {isOverToday ? `Over by ${formatZar(todaySpent - metrics.dailySafeToSpend)}` : `${formatZar(remainingToday)} left today`}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isOverToday
                ? 'bg-rose-500'
                : percentTodaySpent > 75
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percentTodaySpent}%` }}
          />
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={onQuickLog}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-[0.98] transition-all"
        >
          <span>⚡ Log Expense (3 Taps)</span>
        </button>

        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className={`p-3 rounded-xl border flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors ${
            isDark ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'
          }`}
          title="See Safe-To-Spend Calculation Math"
        >
          {showBreakdown ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Calculation Math Breakdown Accordion */}
      {showBreakdown && (
        <div
          className={`mt-4 pt-3 border-t text-xs space-y-2 animate-in fade-in duration-150 ${
            isDark ? 'border-slate-800 text-slate-300' : 'border-slate-200 text-slate-600'
          }`}
        >
          <div className="flex justify-between items-center">
            <span>Bank Balance:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{formatZar(user.currentBalance)}</span>
          </div>
          <div className="flex justify-between items-center text-rose-500">
            <span>- Unpaid Fixed Costs (Rent, Taxis, Data):</span>
            <span className="font-mono">-{formatZar(unpaidCosts)}</span>
          </div>
          <div className="flex justify-between items-center text-amber-500">
            <span>- Savings Buffer Reserve:</span>
            <span className="font-mono">
              -{formatZar(Math.max(0, user.currentBalance - unpaidCosts - metrics.availableSpendablePool))}
            </span>
          </div>
          <div className="h-px bg-slate-200 dark:bg-slate-800 my-1"></div>
          <div className="flex justify-between items-center font-bold text-emerald-600 dark:text-emerald-400">
            <span>= Available Spendable Pool:</span>
            <span className="font-mono">{formatZar(metrics.availableSpendablePool)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 italic">
            <span>÷ {metrics.daysUntilNextPayday} days until payday</span>
            <span className="font-mono font-semibold">{formatZar(metrics.dailySafeToSpend)} / day</span>
          </div>
        </div>
      )}
    </div>
  );
};

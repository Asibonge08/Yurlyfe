/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  SafeToSpendMetrics, 
  UserProfile, 
  IncomeSource, 
  FixedCost, 
  SavingsGoal, 
  ExpenseItem,
  ExpenseCategory 
} from '../types';
import { SafeToSpendCard } from './SafeToSpendCard';
import { SurvivalAlertBanner } from './SurvivalAlertBanner';
import { formatZar, formatDateShort, CATEGORY_META } from '../utils/calculations';
import { 
  Plus, 
  Calendar, 
  Sparkles, 
  CheckCircle, 
  Trash2,
  BookOpen,
  Users,
  Utensils,
  PieChart as PieChartIcon,
  Flame,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';

interface DashboardViewProps {
  metrics: SafeToSpendMetrics;
  user: UserProfile;
  incomes: IncomeSource[];
  fixedCosts: FixedCost[];
  savingsGoals: SavingsGoal[];
  expenses: ExpenseItem[];
  theme: 'dark' | 'light';
  onQuickLog: () => void;
  onOpenCoachWithPrompt: (prompt: string) => void;
  onDeleteExpense: (id: string) => void;
  onNavigateToTab: (tab: any) => void;
  onToggleFixedCostPaid: (id: string) => void;
  onUpdateSavingsGoal?: (goalId: string, addedAmount: number) => void;
  onAddSavingsGoal?: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  user,
  incomes,
  fixedCosts,
  savingsGoals,
  expenses,
  theme,
  onQuickLog,
  onOpenCoachWithPrompt,
  onDeleteExpense,
  onNavigateToTab,
  onToggleFixedCostPaid,
  onUpdateSavingsGoal,
  onAddSavingsGoal,
}) => {
  const isDark = theme === 'dark';
  const [timeFilter, setTimeFilter] = useState<'week' | 'all'>('week');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Savings Goal Modal State
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState<number | string>(600);
  const [newGoalIcon, setNewGoalIcon] = useState('🎯');

  // Filter today's expenses
  const todayStr = new Date().toISOString().split('T')[0];
  const todayExpenses = expenses.filter((e) => e.date.startsWith(todayStr));

  // Upcoming unpaid fixed costs
  const upcomingBills = fixedCosts.filter((fc) => !fc.isPaid);

  // Compute category spending data for the Pie Chart
  const filteredExpenses = useMemo(() => {
    if (timeFilter === 'week') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
    }
    return expenses;
  }, [expenses, timeFilter]);

  const totalFilteredSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const pieChartData = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      food: 0,
      transport: 0,
      data: 0,
      books: 0,
      social: 0,
      other: 0,
    };

    filteredExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    const items = (Object.keys(totals) as ExpenseCategory[])
      .filter((cat) => totals[cat] > 0)
      .map((cat) => {
        const meta = CATEGORY_META[cat];
        const val = totals[cat];
        const pct = totalFilteredSpent > 0 ? Math.round((val / totalFilteredSpent) * 100) : 0;
        return {
          category: cat,
          name: meta.label,
          icon: meta.icon,
          value: val,
          color: meta.color,
          percentage: pct,
        };
      })
      .sort((a, b) => b.value - a.value);

    return items;
  }, [filteredExpenses, totalFilteredSpent]);

  // Find biggest spending category
  const biggestHabit = pieChartData.length > 0 ? pieChartData[0] : null;

  // Custom tooltip for Recharts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className={`px-3 py-2 rounded-xl border shadow-xl text-xs backdrop-blur-md z-50 ${
            isDark
              ? 'bg-slate-900/95 border-slate-750 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            <span className="text-sm">{data.icon}</span>
            <span>{data.name}</span>
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {formatZar(data.value)}
            </span>
            <span className="text-[10px] text-slate-400">({data.percentage}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-3">
      {/* 1. Flagship Safe-To-Spend Card */}
      <SafeToSpendCard
        metrics={metrics}
        user={user}
        incomes={incomes}
        fixedCosts={fixedCosts}
        savingsGoals={savingsGoals}
        todayExpenses={todayExpenses}
        theme={theme}
        onQuickLog={onQuickLog}
      />

      {/* 2. Month-End Survival Alert Banner */}
      <SurvivalAlertBanner
        metrics={metrics}
        theme={theme}
        onAskCoachForSurvivalPlan={() =>
          onOpenCoachWithPrompt(
            `I'm pacing at R${Math.round(metrics.actualDailyBurnRate)}/day and my safe limit is R${Math.round(
              metrics.dailySafeToSpend
            )}/day. Can you give me a realistic 3-step student survival plan to not run out before ${
              metrics.nextPaydaySource
            }?`
          )
        }
      />

      {/* 3. Quick Stats Overview Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Available Bank Balance */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Bank Balance
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black font-mono text-slate-900 dark:text-white">
              {formatZar(user.currentBalance)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">In your student account</span>
        </div>

        {/* Next Expected Payday */}
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Next Income
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              +{formatZar(metrics.expectedNextIncome, false)}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block truncate">
            {formatDateShort(metrics.nextPaydayDate)} ({metrics.daysUntilNextPayday}d)
          </span>
        </div>
      </div>

      {/* 4. Student Savings Goals (Custom Progress Bars) */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎯</span>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Savings Goals Progress
              </h3>
              <p className="text-[10px] text-slate-400">Track your distance to emergency & study targets</p>
            </div>
          </div>

          <button
            onClick={() => setIsAddGoalModalOpen(true)}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>New Goal</span>
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <p>No active savings goals.</p>
            <button
              onClick={() => setIsAddGoalModalOpen(true)}
              className="mt-2 text-xs font-bold text-emerald-500 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> Set up your emergency buffer
            </button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {savingsGoals.map((goal) => {
              const percent = Math.min(
                100,
                Math.round((goal.currentSaved / Math.max(1, goal.targetAmount)) * 100)
              );
              const remaining = Math.max(0, goal.targetAmount - goal.currentSaved);
              const isCompleted = goal.currentSaved >= goal.targetAmount;

              return (
                <div
                  key={goal.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl shrink-0">{goal.icon || '🎯'}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate leading-tight">
                          {goal.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {goal.category || 'Target'} {goal.targetDate && `• By ${formatDateShort(goal.targetDate)}`}
                        </span>
                      </div>
                    </div>

                    {/* Percentage Indicator Badge */}
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                          : percent > 60
                          ? 'bg-teal-500/15 text-teal-500 dark:text-teal-400 border-teal-500/30'
                          : 'bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border-indigo-500/30'
                      }`}
                    >
                      {percent}% achieved
                    </span>
                  </div>

                  {/* Amounts Row */}
                  <div className="flex items-baseline justify-between text-xs mb-2">
                    <div>
                      <span className="text-slate-400 text-[10px] block">Saved so far</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatZar(goal.currentSaved)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-400 text-[10px] block">Target Goal</span>
                      <span className="font-mono font-semibold text-slate-500 dark:text-slate-400">
                        {formatZar(goal.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Custom Progress Bar with Glowing Gradient */}
                  <div className="relative w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700/80 overflow-hidden shadow-inner mb-2.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 relative ${
                        isCompleted
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          : percent > 50
                          ? 'bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400'
                          : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400'
                      }`}
                      style={{ width: `${percent}%` }}
                    >
                      {/* Pulse dot at progress head */}
                      {percent > 5 && percent < 100 && (
                        <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/60 rounded-full animate-pulse" />
                      )}
                    </div>
                  </div>

                  {/* Remaining Distance & Quick Deposit Actions */}
                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">
                      {isCompleted ? (
                        <strong className="text-emerald-500 font-bold">Goal achieved! 🎉</strong>
                      ) : (
                        <span>
                          <strong className="font-mono text-slate-700 dark:text-slate-300">
                            {formatZar(remaining)}
                          </strong>{' '}
                          needed
                        </span>
                      )}
                    </span>

                    {/* Quick Deposit Buttons */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-slate-400 mr-0.5">Deposit:</span>
                      {[20, 50, 100].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => {
                            if (onUpdateSavingsGoal) {
                              onUpdateSavingsGoal(goal.id, amt);
                            }
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold transition-all active:scale-95"
                          title={`Deposit R${amt} toward this goal`}
                        >
                          +R{amt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Spending Breakdown by Category (Recharts Pie Chart) */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Spending Breakdown
              </h3>
              <p className="text-[10px] text-slate-400">Discover your biggest money habits</p>
            </div>
          </div>

          {/* Time Filter Switcher */}
          <div className="flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
            <button
              onClick={() => setTimeFilter('week')}
              className={`px-2 py-1 rounded-lg transition-all ${
                timeFilter === 'week'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2 py-1 rounded-lg transition-all ${
                timeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        {pieChartData.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <p className="mb-2">No expenses logged for this period yet.</p>
            <button
              onClick={onQuickLog}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log your first expense</span>
            </button>
          </div>
        ) : (
          <div>
            {/* Recharts Pie Container */}
            <div className="relative h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomPieTooltip />} />
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={74}
                    paddingAngle={3}
                    dataKey="value"
                    animationDuration={800}
                  >
                    {pieChartData.map((entry) => (
                      <Cell
                        key={`cell-${entry.category}`}
                        fill={entry.color}
                        stroke={isDark ? '#0f172a' : '#ffffff'}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Hole Total Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Total
                </span>
                <span className="text-base font-black font-mono text-slate-900 dark:text-white leading-tight">
                  {formatZar(totalFilteredSpent, false)}
                </span>
                <span className="text-[9px] text-slate-400">
                  {pieChartData.length} {pieChartData.length === 1 ? 'category' : 'categories'}
                </span>
              </div>
            </div>

            {/* Biggest Habit Callout Banner */}
            {biggestHabit && (
              <div className="mt-1 mb-3.5 p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[11px] leading-tight font-semibold">
                      <strong>#{1} Habit:</strong> {biggestHabit.icon} {biggestHabit.name} ({biggestHabit.percentage}% of spending)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() =>
                    onOpenCoachWithPrompt(
                      `My pie chart shows ${biggestHabit.name} is my highest expense (${formatZar(
                        biggestHabit.value
                      )}, ${biggestHabit.percentage}% of total). How can I cut back without missing out on student life?`
                    )
                  }
                  className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline shrink-0 flex items-center gap-0.5"
                >
                  <span>Tips</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Category Breakdown Chips / Legend */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              {pieChartData.map((item) => (
                <div
                  key={item.category}
                  className={`p-2 rounded-xl border flex items-center justify-between transition-colors ${
                    isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-150'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 pr-1">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.icon} {item.name.split('&')[0].trim()}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block leading-none">
                      {formatZar(item.value, false)}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Upcoming Fixed Costs / Essentials to Protect */}
      {upcomingBills.length > 0 && (
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upcoming Fixed Bills ({upcomingBills.length})
            </h4>
            <span className="text-[10px] text-slate-400">Reserved from daily spend</span>
          </div>

          <div className="space-y-2">
            {upcomingBills.map((bill) => (
              <div
                key={bill.id}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                  isDark ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleFixedCostPaid(bill.id)}
                    className="w-5 h-5 rounded-lg border flex items-center justify-center border-slate-300 dark:border-slate-600 hover:border-emerald-500"
                    title="Mark as Paid"
                  >
                    {bill.isPaid && <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />}
                  </button>
                  <div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-tight">
                      {bill.name}
                    </p>
                    <p className="text-[10px] text-slate-400">Due {formatDateShort(bill.dueDate)}</p>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs text-rose-500">
                  {formatZar(bill.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. Quick Student Shortcuts */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => onNavigateToTab('tools')}
          className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800 shadow-sm'
          }`}
        >
          <BookOpen className="w-4 h-4 mx-auto text-amber-500 mb-1" />
          <span className="text-[11px] font-bold block leading-tight">Textbooks</span>
          <span className="text-[9px] text-slate-400">2nd-hand savings</span>
        </button>

        <button
          onClick={() => onNavigateToTab('tools')}
          className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800 shadow-sm'
          }`}
        >
          <Users className="w-4 h-4 mx-auto text-blue-500 mb-1" />
          <span className="text-[11px] font-bold block leading-tight">Split Bill</span>
          <span className="text-[9px] text-slate-400">Res / Taxi split</span>
        </button>

        <button
          onClick={() => onNavigateToTab('tools')}
          className={`p-3 rounded-2xl border text-center transition-all hover:scale-[1.02] ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-800 shadow-sm'
          }`}
        >
          <Utensils className="w-4 h-4 mx-auto text-emerald-500 mb-1" />
          <span className="text-[11px] font-bold block leading-tight">Meal Plan</span>
          <span className="text-[9px] text-slate-400">From R140/wk</span>
        </button>
      </div>

      {/* 7. Recent Expenses Feed */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent Expenses ({expenses.length})
          </h4>
          <button
            onClick={onQuickLog}
            className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>

        {expenses.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No expenses logged yet. Tap "+ Add" to log your first coffee or taxi!
          </div>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 6).map((expense) => {
              const meta = CATEGORY_META[expense.category] || CATEGORY_META.other;
              return (
                <div
                  key={expense.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors group ${
                    isDark ? 'bg-slate-800/40 border-slate-800/80 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-lg shrink-0">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                        {expense.note || meta.label}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatDateShort(expense.date)} • {meta.label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      -{formatZar(expense.amount)}
                    </span>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500"
                      title="Delete expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create New Savings Goal */}
      {isAddGoalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-3.5 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Add New Student Savings Goal</h3>
              <button
                onClick={() => setIsAddGoalModalOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newGoalName.trim()) return;
                const target = Number(newGoalTarget) || 500;
                if (onAddSavingsGoal) {
                  onAddSavingsGoal({
                    name: newGoalName.trim(),
                    targetAmount: target,
                    currentSaved: 0,
                    icon: newGoalIcon,
                    category: 'Student Buffer',
                  });
                }
                setNewGoalName('');
                setIsAddGoalModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-400 font-bold mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Res Medical Buffer, Bus Home, Laptop"
                  value={newGoalName}
                  onChange={(e) => setNewGoalName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Target Amount (R)</label>
                  <input
                    type="number"
                    min="50"
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(e.target.value)}
                    className={`w-full p-2 rounded-xl border font-mono font-bold ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Icon / Emoji</label>
                  <select
                    value={newGoalIcon}
                    onChange={(e) => setNewGoalIcon(e.target.value)}
                    className={`w-full p-2 rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="🎯">🎯 Target</option>
                    <option value="🛡️">🛡️ Emergency</option>
                    <option value="🚌">🚌 Travel / Bus</option>
                    <option value="💻">💻 Tech / Laptop</option>
                    <option value="📚">📚 Textbooks</option>
                    <option value="👟">👟 Clothes / Shoes</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddGoalModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  WeeklySummary, 
  WeeklyChallenge, 
  ExpenseItem, 
  SafeToSpendMetrics,
  UserProfile 
} from '../types';
import { formatZar, CATEGORY_META } from '../utils/calculations';
import { 
  AlertCircle, 
  TrendingDown, 
  TrendingUp, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Lightbulb, 
  ArrowRight, 
  Calendar, 
  Activity, 
  Zap 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine, 
  Area, 
  AreaChart 
} from 'recharts';

interface WeeklySummaryViewProps {
  summary: WeeklySummary;
  challenge: WeeklyChallenge;
  metrics?: SafeToSpendMetrics;
  onToggleChallengeCompleted: () => void;
  onAskCoachForAudit: (leakTitle: string) => void;
  theme: 'dark' | 'light';
}

// 7-Day Spending trend data (Monday through Sunday)
const DEFAULT_WEEK_TREND = [
  { day: 'Mon', fullDay: 'Monday', spent: 63, limit: 80, topItem: 'Tuckshop & Taxi' },
  { day: 'Tue', fullDay: 'Tuesday', spent: 45, limit: 80, topItem: 'Campus Lunch' },
  { day: 'Wed', fullDay: 'Wednesday', spent: 115, limit: 80, topItem: 'MTN Data Bundle' },
  { day: 'Thu', fullDay: 'Thursday', spent: 38, limit: 80, topItem: 'Minibus Taxi' },
  { day: 'Fri', fullDay: 'Friday', spent: 140, limit: 80, topItem: 'Student Social Night' },
  { day: 'Sat', fullDay: 'Saturday', spent: 85, limit: 80, topItem: 'Shoprite Groceries' },
  { day: 'Sun', fullDay: 'Sunday', spent: 25, limit: 80, topItem: 'Res Snacks' },
];

export const WeeklySummaryView: React.FC<WeeklySummaryViewProps> = ({
  summary,
  challenge,
  metrics,
  onToggleChallengeCompleted,
  onAskCoachForAudit,
  theme,
}) => {
  const isDark = theme === 'dark';
  const safeLimit = metrics ? Math.round(metrics.dailySafeToSpend) : 80;

  // Compute stats for the week
  const trendData = useMemo(() => {
    return DEFAULT_WEEK_TREND.map((d) => ({
      ...d,
      limit: safeLimit,
      isOver: d.spent > safeLimit,
    }));
  }, [safeLimit]);

  const peakDay = useMemo(() => {
    return [...trendData].sort((a, b) => b.spent - a.spent)[0];
  }, [trendData]);

  const lowestDay = useMemo(() => {
    return [...trendData].sort((a, b) => a.spent - b.spent)[0];
  }, [trendData]);

  // Custom Recharts Tooltip
  const CustomLineTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isOver = data.spent > data.limit;

      return (
        <div
          className={`px-3.5 py-2.5 rounded-2xl border shadow-xl text-xs backdrop-blur-md z-50 ${
            isDark
              ? 'bg-slate-900/95 border-slate-750 text-white'
              : 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-3 font-bold mb-1">
            <span>{data.fullDay}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                isOver ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'
              }`}
            >
              {isOver ? `Over by R${data.spent - data.limit}` : `Under limit`}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-base font-black text-slate-900 dark:text-white">
              {formatZar(data.spent)}
            </span>
            <span className="text-[10px] text-slate-400">spent</span>
          </div>

          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between gap-2 border-t border-slate-200 dark:border-slate-800 pt-1">
            <span>Top: {data.topItem}</span>
            <span>Limit: R{data.limit}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-3 select-none">
      {/* Week Header Digest Card */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 to-slate-900/90 border-slate-800 text-white'
            : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100 text-slate-900 shadow-sm'
        }`}
      >
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-1">
          Weekly Spending Digest
        </span>
        <h2 className="text-xl font-black">{summary.weekRange}</h2>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-3xl font-black font-mono">
            {formatZar(summary.totalSpent)}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">total logged this week</span>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. RECHARTS LINE CHART: 7-DAY SPENDING TRENDS (MON - SUN) */}
      {/* ============================================================== */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                7-Day Spending Trend
              </h3>
              <p className="text-[10px] text-slate-400">Monday to Sunday pace vs daily limit</p>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            Limit: R{safeLimit}/d
          </span>
        </div>

        {/* Recharts Line Chart Container */}
        <div className="h-52 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? '#334155' : '#e2e8f0'}
                opacity={0.4}
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10, fontFamily: 'monospace' }}
                tickFormatter={(val) => `R${val}`}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomLineTooltip />} />
              <ReferenceLine
                y={safeLimit}
                stroke="#10b981"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Safe Limit',
                  position: 'insideTopRight',
                  fill: '#10b981',
                  fontSize: 10,
                  fontWeight: 700,
                }}
              />
              <Line
                type="monotone"
                dataKey="spent"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: isDark ? '#0f172a' : '#ffffff' }}
                activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Peak & Low Insights Bar */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div
            className={`p-2 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Highest Spend</span>
              <strong className="text-slate-900 dark:text-white">{peakDay.fullDay}</strong>
            </div>
            <span className="font-mono font-bold text-rose-500 text-xs">
              {formatZar(peakDay.spent)}
            </span>
          </div>

          <div
            className={`p-2 rounded-xl border flex items-center justify-between ${
              isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Thriftiest Day</span>
              <strong className="text-slate-900 dark:text-white">{lowestDay.fullDay}</strong>
            </div>
            <span className="font-mono font-bold text-emerald-500 text-xs">
              {formatZar(lowestDay.spent)}
            </span>
          </div>
        </div>
      </div>

      {/* Top 3 Money Leaks Section */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-base">🚰</span>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top 3 Money Leaks
            </h3>
          </div>
          <span className="text-[10px] text-slate-400">Where cash slipped away</span>
        </div>

        {summary.topLeaks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No expenses logged in the past 7 days! You're either on a streak or need to log recent buys.
          </div>
        ) : (
          <div className="space-y-3">
            {summary.topLeaks.map((leak, idx) => {
              const meta = CATEGORY_META[leak.category];
              return (
                <div
                  key={leak.category}
                  className={`p-3 rounded-2xl border transition-all ${
                    isDark ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{meta.icon}</span>
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block leading-tight">
                          #{idx + 1} {meta.label}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {leak.percentageOfSpending}% of your weekly spend
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-rose-500">
                      {formatZar(leak.totalSpent)}
                    </span>
                  </div>

                  {/* Student Smart Insight */}
                  <div className="mt-2 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] flex items-start gap-1.5 leading-snug">
                    <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
                    <span>{leak.insight}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Weekly Student Challenge Card */}
      <div
        className={`p-5 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-tr from-indigo-950/30 to-purple-950/30 border-indigo-900/40 text-white'
            : 'bg-gradient-to-tr from-indigo-50 to-purple-50 border-indigo-100 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              One Challenge For Next Week
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Saves ~{formatZar(challenge.potentialSavings, false)}
          </span>
        </div>

        <h4 className="font-black text-base mb-1">{challenge.title}</h4>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          {challenge.description}
        </p>

        {/* Interactive Completion Button */}
        <button
          onClick={onToggleChallengeCompleted}
          className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            challenge.completed
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20'
          }`}
        >
          {challenge.completed ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Challenge Completed! (+R{challenge.potentialSavings} saved)</span>
            </>
          ) : (
            <span>Mark as Completed for this Week</span>
          )}
        </button>
      </div>

      {/* Button to ask AI Coach for deep leak audit */}
      <button
        onClick={() => onAskCoachForAudit(summary.topLeaks[0]?.label || 'my spending')}
        className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        <span>Ask AI Coach to Plug These Leaks</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

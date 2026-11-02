/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Flame, 
  ArrowRight, 
  X, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  MessageSquare, 
  BarChart2, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { BudgetThresholdNotification } from '../types';
import { formatZar } from '../utils/calculations';

interface BudgetThresholdAlertProps {
  notification: BudgetThresholdNotification;
  onDismiss: () => void;
  onAskCoach: (prompt: string) => void;
  onNavigateToSummary: () => void;
  theme: 'dark' | 'light';
}

export const BudgetThresholdAlert: React.FC<BudgetThresholdAlertProps> = ({
  notification,
  onDismiss,
  onAskCoach,
  onNavigateToSummary,
  theme,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isDark = theme === 'dark';
  const isCritical = notification.urgency === 'critical';

  // Calculate percentage clamped for progress bar width
  const progressPercentClamped = Math.min(100, Math.max(0, notification.percentage));

  const handleCoachClick = () => {
    const prompt = isCritical
      ? `🚨 Urgent: I've exceeded 100% of my weekly budget (spent ${formatZar(notification.weeklySpent)} of ${formatZar(notification.weeklyBudget)}). Please give me an emergency student survival budget and low-cost meal plan for the rest of this week!`
      : `⚠️ Budget Alert: I've reached ${notification.percentage}% of my weekly budget (${formatZar(notification.weeklySpent)} of ${formatZar(notification.weeklyBudget)}). How should I pace my daily spending so I don't run out before next week?`;
    onAskCoach(prompt);
  };

  return (
    <div
      className={`mx-4 mt-3 mb-2 rounded-2xl border transition-all duration-300 shadow-lg overflow-hidden ${
        isCritical
          ? isDark
            ? 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-950/40 border-rose-500/40 text-rose-100 shadow-rose-950/30'
            : 'bg-gradient-to-br from-rose-50 via-white to-amber-50 border-rose-300 text-slate-800 shadow-rose-100'
          : isDark
          ? 'bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-950/40 border-amber-500/40 text-amber-100 shadow-amber-950/30'
          : 'bg-gradient-to-br from-amber-50 via-white to-orange-50 border-amber-300 text-slate-800 shadow-amber-100'
      }`}
    >
      {/* Top Banner Header */}
      <div className="p-3.5 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isCritical
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-amber-500 text-white'
            }`}
          >
            {isCritical ? (
              <Flame className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] uppercase tracking-wider font-black px-2 py-0.5 rounded-full ${
                  isCritical
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {notification.percentage}% WEEKLY THRESHOLD
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Pacing Alert
              </span>
            </div>
            <h4 className="font-bold text-sm tracking-tight truncate mt-0.5 text-white dark:text-white">
              {notification.title}
            </h4>
          </div>
        </div>

        {/* Right side controls: Expand & Dismiss */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title={isExpanded ? 'Collapse Alert' : 'Expand Details'}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            title="Dismiss Alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="px-3.5 pb-3.5 pt-1 space-y-3">
          {/* Notification Message */}
          <p className="text-xs leading-relaxed text-slate-300">
            {notification.message}
          </p>

          {/* Visual Progress Bar with 80% and 100% Markers */}
          <div className="bg-black/25 dark:bg-black/40 p-2.5 rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium">
              <span className="text-slate-300">
                Spent: <strong className="text-white">{formatZar(notification.weeklySpent)}</strong>
              </span>
              <span className="text-slate-300">
                Weekly Budget: <strong className="text-white">{formatZar(notification.weeklyBudget)}</strong>
              </span>
            </div>

            {/* The progress track with 80% threshold marker */}
            <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5">
              {/* Threshold Guide line at 80% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400/80 z-10"
                style={{ left: '80%' }}
                title="80% Budget Threshold"
              />

              {/* Progress bar fill */}
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical
                    ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-red-600'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                }`}
                style={{ width: `${progressPercentClamped}%` }}
              />
            </div>

            {/* Labels under progress bar */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
              <span>R0</span>
              <span className="text-amber-400 font-bold flex items-center gap-0.5">
                <span>⚠️ 80% Alert</span>
              </span>
              <span>100% ({formatZar(notification.weeklyBudget, false)})</span>
            </div>
          </div>

          {/* Action Recommendation */}
          <div className="flex items-start gap-2 text-xs bg-white/5 p-2 rounded-xl text-slate-300">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>{notification.suggestedAction}</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={handleCoachClick}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Coach</span>
            </button>
            <button
              onClick={onNavigateToSummary}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <BarChart2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>View Leaks</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

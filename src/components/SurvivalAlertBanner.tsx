/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { SafeToSpendMetrics } from '../types';
import { formatZar } from '../utils/calculations';

interface SurvivalAlertBannerProps {
  metrics: SafeToSpendMetrics;
  theme: 'dark' | 'light';
  onAskCoachForSurvivalPlan: () => void;
}

export const SurvivalAlertBanner: React.FC<SurvivalAlertBannerProps> = ({
  metrics,
  theme,
  onAskCoachForSurvivalPlan,
}) => {
  const isDark = theme === 'dark';

  if (metrics.riskLevel === 'safe') {
    return (
      <div
        className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
          isDark
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
            : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <div>
            <p className="font-semibold text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Month-End Survival Pacing: Healthy
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your spending is well within your {formatZar(metrics.dailySafeToSpend, false)}/day safe limit.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isDanger = metrics.riskLevel === 'danger';

  return (
    <div
      className={`p-4 rounded-2xl border shadow-sm transition-all ${
        isDanger
          ? isDark
            ? 'bg-rose-950/30 border-rose-800/60 text-rose-200'
            : 'bg-rose-50 border-rose-200 text-rose-900'
          : isDark
          ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
          : 'bg-amber-50 border-amber-200 text-amber-900'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-xl shrink-0 ${
            isDanger ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
          }`}
        >
          {isDanger ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="font-bold text-xs uppercase tracking-wider">
              {isDanger ? '🚨 Month-End Survival Alert' : '⚠️ Spending Pace Warning'}
            </h4>
            {metrics.daysDeficit > 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                {metrics.daysDeficit} days deficit
              </span>
            )}
          </div>

          <p className="text-xs leading-relaxed mb-3">
            {metrics.survivalMessage}
          </p>

          <button
            onClick={onAskCoachForSurvivalPlan}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                : 'bg-amber-600 hover:bg-amber-500 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get AI Coach Survival Advice</span>
            <ArrowRight className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

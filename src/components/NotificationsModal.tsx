/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Flame, 
  Calendar, 
  CreditCard, 
  Sparkles, 
  Sliders, 
  CheckCircle, 
  MessageSquare, 
  TrendingUp,
  RefreshCw,
  Plus
} from 'lucide-react';
import { BudgetThresholdNotification, InAppNotification, FixedCost } from '../types';
import { formatZar } from '../utils/calculations';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  thresholdNotification: BudgetThresholdNotification | null;
  subscriptionAlerts: InAppNotification[];
  thresholdPercent: number;
  onChangeThresholdPercent: (newPercent: number) => void;
  onAskCoach: (prompt: string) => void;
  onAddTestExpense: (amount: number, note: string) => void;
  onResetDismissedAlert: () => void;
  isAlertDismissed: boolean;
  theme: 'dark' | 'light';
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  thresholdNotification,
  subscriptionAlerts,
  thresholdPercent,
  onChangeThresholdPercent,
  onAskCoach,
  onAddTestExpense,
  onResetDismissedAlert,
  isAlertDismissed,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'settings'>('all');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const totalAlertsCount = (thresholdNotification ? 1 : 0) + subscriptionAlerts.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-md rounded-3xl border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transition-all ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">Alerts & Notifications</h3>
                {totalAlertsCount > 0 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-rose-500 text-white">
                    {totalAlertsCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Budget thresholds & 5-day subscription due reminders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-slate-800/40 px-4 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'all'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Active Alerts ({totalAlertsCount})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Threshold Settings ({thresholdPercent}%)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'all' ? (
            <>
              {/* 1. Budget Threshold Alert Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                    Weekly Budget Threshold ({thresholdPercent}%)
                  </h4>
                  {isAlertDismissed && thresholdNotification && (
                    <button
                      onClick={onResetDismissedAlert}
                      className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Restore Top Banner
                    </button>
                  )}
                </div>

                {thresholdNotification ? (
                  <div
                    className={`p-3.5 rounded-2xl border transition-all ${
                      thresholdNotification.urgency === 'critical'
                        ? 'bg-rose-950/40 border-rose-500/30 text-rose-100'
                        : 'bg-amber-950/40 border-amber-500/30 text-amber-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          thresholdNotification.urgency === 'critical'
                            ? 'bg-rose-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {thresholdNotification.urgency === 'critical' ? (
                          <Flame className="w-4 h-4" />
                        ) : (
                          <AlertTriangle className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-sm text-white">
                            {thresholdNotification.title}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              thresholdNotification.urgency === 'critical'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {thresholdNotification.percentage}% Spent
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          {thresholdNotification.message}
                        </p>

                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                          <span className="text-slate-400">
                            Spent: <strong className="text-white">{formatZar(thresholdNotification.weeklySpent)}</strong> / {formatZar(thresholdNotification.weeklyBudget)}
                          </span>
                          <button
                            onClick={() => {
                              onClose();
                              onAskCoach(
                                `My weekly spending has reached ${thresholdNotification.percentage}% of my calculated budget. Help me plan my daily meals and essentials for the rest of this week!`
                              );
                            }}
                            className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Coach Pacing Advice
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3 text-slate-300">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-300">
                        Spending is within the {thresholdPercent}% safety zone!
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Your weekly spend has not exceeded {thresholdPercent}% of your safe weekly allowance.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. 5-Day Prior Subscription Due Reminders Section */}
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Upcoming Subscriptions & Bills (5 Days Prior)
                </h4>

                {subscriptionAlerts.length > 0 ? (
                  <div className="space-y-2">
                    {subscriptionAlerts.map((alert) => (
                      <div
                        key={alert.id}
                        className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-slate-200"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <CreditCard className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-bold text-xs text-white">
                              {alert.title}
                            </h5>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {alert.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-800/30 border border-slate-700/40 text-slate-400 text-xs text-center py-4">
                    No subscriptions or recurring fixed costs due in the next 5 days.
                  </div>
                )}
              </div>

              {/* 3. Quick Simulation / Test Controls */}
              <div className="pt-3 border-t border-slate-800/60">
                <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Test Threshold Alert in Real-Time
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onAddTestExpense(80, 'Quick tuckshop lunch & cold drink');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                    Log +R80 Expense
                  </button>
                  <button
                    onClick={() => {
                      onAddTestExpense(200, 'Campus textbook & stationary run');
                    }}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-400" />
                    Log +R200 Expense
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Settings Tab */
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">
                    Weekly Budget Alert Trigger
                  </h4>
                  <span className="font-black text-sm px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {thresholdPercent}%
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Choose what percentage of your calculated weekly budget will trigger the in-app safety alert. The default student recommendation is 80%.
                </p>

                {/* Slider */}
                <div className="space-y-2 pt-2">
                  <input
                    type="range"
                    min="60"
                    max="95"
                    step="5"
                    value={thresholdPercent}
                    onChange={(e) => onChangeThresholdPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                    <span>60% (Strict)</span>
                    <span className="text-emerald-400 font-bold">80% (Default)</span>
                    <span>95% (Lenient)</span>
                  </div>
                </div>

                {/* Preset quick buttons */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[70, 80, 90].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => onChangeThresholdPercent(pct)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        thresholdPercent === pct
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* 5-Day Prior Subscription Rule explanation */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Subscription Due Rules
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  yurlyfe automatically scans all fixed costs and active subscriptions (digs rent, mobile data bundles, student streaming) and issues an alert exactly 5 days before each due date so you are never caught unprepared.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

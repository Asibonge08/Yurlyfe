/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Moon, Sun, Shield, Sparkles, User, RefreshCw, Bell } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
  theme: 'dark' | 'light';
  notificationCount?: number;
  hasBudgetAlert?: boolean;
  onOpenNotifications: () => void;
  onToggleTheme: () => void;
  onOpenPrivacy: () => void;
  onOpenUpgrade: () => void;
  onRestartOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  theme,
  notificationCount = 0,
  hasBudgetAlert = false,
  onOpenNotifications,
  onToggleTheme,
  onOpenPrivacy,
  onOpenUpgrade,
  onRestartOnboarding,
}) => {
  const isDark = theme === 'dark';

  return (
    <header
      className={`sticky top-0 z-30 px-4 py-3 border-b transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md text-white'
          : 'bg-white/95 border-emerald-100 backdrop-blur-md text-slate-900'
      }`}
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 font-black text-xs">
            YL
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base tracking-tight leading-none bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                yurlyfe
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                HUB
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] leading-tight">
              {user.institution.split('(')[0].trim()}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Premium / Upgrade Badge */}
          {user.isPremium ? (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              PRO
            </span>
          ) : (
            <button
              onClick={onOpenUpgrade}
              className="text-[11px] font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-sm transition-all"
            >
              R39/mo
            </button>
          )}

          {/* In-App Notifications Bell (Budget Threshold & Subscriptions) */}
          <button
            onClick={onOpenNotifications}
            title="Alerts & Threshold Notifications"
            className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
              hasBudgetAlert
                ? 'text-amber-400 hover:text-amber-300'
                : 'text-slate-500 hover:text-emerald-500'
            } ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span
                className={`absolute -top-0.5 -right-0.5 min-w-[15px] h-[15px] px-1 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
                  hasBudgetAlert ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                }`}
              >
                {notificationCount}
              </span>
            )}
          </button>

          {/* POPIA Privacy Shield */}
          <button
            onClick={onOpenPrivacy}
            title="POPIA Privacy & Data Rights"
            className={`p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4 text-emerald-500" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`p-1.5 rounded-lg text-slate-500 hover:text-amber-500 transition-colors ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Re-run Onboarding / Setup */}
          <button
            onClick={onRestartOnboarding}
            title="Reset or Adjust Budget Setup"
            className={`p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 transition-colors ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

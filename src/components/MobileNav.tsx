/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Home, 
  Calendar, 
  BookOpen, 
  Activity, 
  Bot, 
  Plus, 
  Wrench 
} from 'lucide-react';
import { ActiveNavTab } from '../types';

interface MobileNavProps {
  activeTab: ActiveNavTab;
  onSelectTab: (tab: ActiveNavTab) => void;
  onOpenQuickLog: () => void;
  theme: 'dark' | 'light';
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenQuickLog,
  theme,
}) => {
  const isDark = theme === 'dark';

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t transition-colors duration-200 select-none ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 backdrop-blur-md text-slate-400'
          : 'bg-white/95 border-emerald-100 backdrop-blur-md text-slate-500'
      }`}
    >
      <div className="max-w-md mx-auto px-1 py-1 flex items-center justify-between">
        {/* 1. Dashboard / Safe-to-Spend */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'dashboard'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" />
          <span className="text-[9px] leading-tight font-medium">Safe Spend</span>
        </button>

        {/* 2. Tasks & Schedule */}
        <button
          onClick={() => onSelectTab('tasks')}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'tasks'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span className="text-[9px] leading-tight font-medium">Schedule</span>
        </button>

        {/* 3. Study (NotebookLM) */}
        <button
          onClick={() => onSelectTab('study')}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'study'
              ? 'text-indigo-500 dark:text-indigo-400 font-bold'
              : 'hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[9px] leading-tight font-medium">Study RAG</span>
        </button>

        {/* 4. Center Fast Log Button */}
        <button
          onClick={onOpenQuickLog}
          className="px-2 py-0.5 flex flex-col items-center justify-center -mt-3 group active:scale-95 transition-transform"
          title="Fast 3-Tap Log"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:from-emerald-500 group-hover:to-teal-400">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[8px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">Log R</span>
        </button>

        {/* 5. Trends & Weekly Summary */}
        <button
          onClick={() => onSelectTab('summary')}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'summary'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[9px] leading-tight font-medium">Trends</span>
        </button>

        {/* 6. AI Coach */}
        <button
          onClick={() => onSelectTab('coach')}
          className={`flex-1 py-1 flex flex-col items-center gap-0.5 transition-colors ${
            activeTab === 'coach'
              ? 'text-emerald-500 dark:text-emerald-400 font-bold'
              : 'hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span className="text-[9px] leading-tight font-medium">Coach</span>
        </button>
      </div>
    </nav>
  );
};

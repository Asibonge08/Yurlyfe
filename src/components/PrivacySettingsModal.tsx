/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserProfile, 
  IncomeSource, 
  FixedCost, 
  SavingsGoal, 
  ExpenseItem 
} from '../types';
import { 
  ShieldCheck, 
  Download, 
  Trash2, 
  X, 
  Check, 
  AlertTriangle, 
  FileCheck 
} from 'lucide-react';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  incomes: IncomeSource[];
  fixedCosts: FixedCost[];
  savingsGoals: SavingsGoal[];
  expenses: ExpenseItem[];
  onWipeAllData: () => void;
  onToggleConsent: (granted: boolean) => void;
  theme: 'dark' | 'light';
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  incomes,
  fixedCosts,
  savingsGoals,
  expenses,
  onWipeAllData,
  onToggleConsent,
  theme,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exportedSuccess, setExportedSuccess] = useState(false);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleExportData = () => {
    const exportBundle = {
      app: 'MoneyMate South Africa',
      version: '1.0.0',
      popiaCompliance: 'Act 4 of 2013',
      exportDate: new Date().toISOString(),
      user,
      incomes,
      fixedCosts,
      savingsGoals,
      expenses,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MoneyMate_Student_Data_Export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportedSuccess(true);
    setTimeout(() => setExportedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border flex flex-col max-h-[92vh] overflow-y-auto ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-emerald-100 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">POPIA Privacy & Data Rights</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Protection of Personal Information Act</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* POPIA Highlights */}
        <div className="space-y-4 text-xs">
          <div
            className={`p-3.5 rounded-2xl border ${
              isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <h4 className="font-bold text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4" />
              <span>Our Student Data Guarantee</span>
            </h4>
            <ul className="space-y-1.5 text-slate-600 dark:text-slate-300 text-[11px]">
              <li>• <strong>No selling data:</strong> We never sell your spending habits or personal details to lenders, banks, or marketers.</li>
              <li>• <strong>Row-level privacy:</strong> Your financial entries are tied exclusively to your session and encrypted.</li>
              <li>• <strong>Right to erasure:</strong> You have the legal right to delete all your records with one click at any time.</li>
            </ul>
          </div>

          {/* Consent Toggle */}
          <div className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="font-bold block">POPIA Informed Consent</span>
              <span className="text-[10px] text-slate-400">
                Granted on {user.popiaConsentDate || 'today'}
              </span>
            </div>
            <button
              onClick={() => onToggleConsent(!user.popiaConsentGiven)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                user.popiaConsentGiven
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              {user.popiaConsentGiven ? 'Granted ✓' : 'Disabled'}
            </button>
          </div>

          {/* Export Data Button */}
          <button
            onClick={handleExportData}
            className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
          >
            {exportedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Data Downloaded!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Export All My Data (JSON)</span>
              </>
            )}
          </button>

          {/* Delete All Data / Right to Erasure */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete All My Data (Permanent Wipe)</span>
              </button>
            ) : (
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-2 text-rose-600 dark:text-rose-400">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                  <span>Are you sure? This cannot be undone.</span>
                </div>
                <p className="text-[11px] leading-tight">
                  This will immediately delete all your logged expenses, student budgets, and chat history.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="flex-1 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onWipeAllData();
                      setConfirmDelete(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm"
                  >
                    Yes, Wipe Everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Check, X, Tag, ArrowRight, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgradeSuccess: (referralCode?: string) => void;
  theme: 'dark' | 'light';
}

const VALID_SOCIETY_CODES = ['SRC2026', 'SASCO', 'DASO', 'AIESEC', 'MEDSOC', 'ENGSOC', 'LAWSOC'];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpgradeSuccess,
  theme,
}) => {
  const [code, setCode] = useState('');
  const [codeSuccess, setCodeSuccess] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleApplyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeError(null);
    setCodeSuccess(null);

    const clean = code.trim().toUpperCase();
    if (VALID_SOCIETY_CODES.includes(clean)) {
      setCodeSuccess(`🎉 Student Society discount applied (${clean})! Enjoy 1 Month Free MoneyMate Pro.`);
      setTimeout(() => {
        onUpgradeSuccess(clean);
        onClose();
      }, 1500);
    } else {
      setCodeError('Invalid referral code. Try "SRC2026", "AIESEC", or "DASO".');
    }
  };

  const handleSubscribe = () => {
    onUpgradeSuccess();
    onClose();
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
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 text-white flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">MoneyMate Pro</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Student-priced at just R39 / month</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pricing Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white text-center shadow-lg shadow-emerald-500/20 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100">
            Student Affordable Plan
          </span>
          <div className="flex items-baseline justify-center gap-1 my-1">
            <span className="text-4xl font-black font-mono">R39</span>
            <span className="text-xs text-emerald-100 font-semibold">/ month</span>
          </div>
          <p className="text-[11px] text-emerald-100">
            Less than one campus takeout meal. Cancel anytime with 1 tap.
          </p>
        </div>

        {/* Feature Comparison */}
        <div className="space-y-2 mb-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong>Unlimited AI Coach chat</strong> with real-time spending insights</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong>Multiple savings targets</strong> (Res buffer, Dec holidays, laptop fund)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong>Export full financial data</strong> & CSV statement reports</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span><strong>High-urgency month-end pacing alerts</strong> & burn rate warnings</span>
          </div>
        </div>

        {/* Student Society Referral Code Input */}
        <div
          className={`p-3.5 rounded-2xl border mb-4 ${
            isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-500" />
            <span>Have a Student Society Referral Code?</span>
          </div>

          <form onSubmit={handleApplyCode} className="flex gap-2">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. SRC2026, SASCO, AIESEC"
              className={`flex-1 px-3 py-2 rounded-xl text-xs uppercase font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white font-bold text-xs"
            >
              Apply
            </button>
          </form>

          {codeSuccess && <p className="text-[11px] text-emerald-500 mt-1.5 font-semibold">{codeSuccess}</p>}
          {codeError && <p className="text-[11px] text-rose-500 mt-1.5">{codeError}</p>}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSubscribe}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          <span>Unlock MoneyMate Pro for R39/mo</span>
        </button>

        <p className="text-[10px] text-slate-400 text-center mt-2">
          Secure student checkout. No contracts.
        </p>
      </div>
    </div>
  );
};

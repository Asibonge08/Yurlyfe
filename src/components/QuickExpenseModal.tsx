/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Upload, Zap, Check, FileText, AlertCircle } from 'lucide-react';
import { ExpenseCategory, ExpenseItem } from '../types';
import { CATEGORY_META, formatZar } from '../utils/calculations';

interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'date'>) => void;
  onBatchAddExpenses: (expenses: Omit<ExpenseItem, 'id'>[]) => void;
  theme: 'dark' | 'light';
}

const AMOUNT_PRESETS = [15, 30, 50, 100, 200];

const CATEGORIES: ExpenseCategory[] = ['food', 'transport', 'data', 'books', 'social', 'other'];

export const QuickExpenseModal: React.FC<QuickExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense,
  onBatchAddExpenses,
  theme,
}) => {
  const [activeTab, setActiveTab] = useState<'3tap' | 'csv'>('3tap');
  const [amount, setAmount] = useState<number | string>(50);
  const [category, setCategory] = useState<ExpenseCategory>('food');
  const [note, setNote] = useState('');
  
  // CSV parse state
  const [csvText, setCsvText] = useState('');
  const [parsedItems, setParsedItems] = useState<Omit<ExpenseItem, 'id'>[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numAmount) || numAmount <= 0) return;

    onAddExpense({
      amount: numAmount,
      category,
      note: note.trim() || undefined,
      source: 'manual',
    });

    // Reset & close
    setNote('');
    onClose();
  };

  const handleParseCsv = (raw: string) => {
    setCsvError(null);
    try {
      const lines = raw.trim().split(/\r?\n/);
      if (lines.length < 2) {
        setCsvError('CSV must have a header row and at least 1 transaction line.');
        return;
      }

      const results: Omit<ExpenseItem, 'id'>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV splitter handling commas
        const parts = line.split(',').map((p) => p.replace(/^["']|["']$/g, '').trim());
        if (parts.length < 2) continue;

        // Try to identify date, description, amount
        let amt = 0;
        let desc = '';
        let date = new Date().toISOString();

        // Check if any column is numeric
        for (const part of parts) {
          const cleanPart = part.replace(/[R\s,]/g, '');
          const val = parseFloat(cleanPart);
          if (!isNaN(val) && val > 0 && amt === 0) {
            amt = val;
          } else if (isNaN(val) && part.length > 2 && !desc) {
            desc = part;
          }
        }

        if (amt > 0) {
          // Infer category based on South African student keywords
          const lowerDesc = desc.toLowerCase();
          let cat: ExpenseCategory = 'other';
          if (
            lowerDesc.includes('shoprite') ||
            lowerDesc.includes('checkers') ||
            lowerDesc.includes('boxer') ||
            lowerDesc.includes('spar') ||
            lowerDesc.includes('pick n pay') ||
            lowerDesc.includes('mcdonald') ||
            lowerDesc.includes('kfc') ||
            lowerDesc.includes('tuckshop') ||
            lowerDesc.includes('food') ||
            lowerDesc.includes('cafe') ||
            lowerDesc.includes('pie')
          ) {
            cat = 'food';
          } else if (
            lowerDesc.includes('uber') ||
            lowerDesc.includes('bolt') ||
            lowerDesc.includes('taxi') ||
            lowerDesc.includes('bus') ||
            lowerDesc.includes('myciti') ||
            lowerDesc.includes('gautrain') ||
            lowerDesc.includes('metro')
          ) {
            cat = 'transport';
          } else if (
            lowerDesc.includes('mtn') ||
            lowerDesc.includes('vodacom') ||
            lowerDesc.includes('telkom') ||
            lowerDesc.includes('cell c') ||
            lowerDesc.includes('airtime') ||
            lowerDesc.includes('data')
          ) {
            cat = 'data';
          } else if (
            lowerDesc.includes('pna') ||
            lowerDesc.includes('van schaik') ||
            lowerDesc.includes('wize') ||
            lowerDesc.includes('print') ||
            lowerDesc.includes('book') ||
            lowerDesc.includes('stationery')
          ) {
            cat = 'books';
          } else if (
            lowerDesc.includes('liquor') ||
            lowerDesc.includes('tops') ||
            lowerDesc.includes('bar') ||
            lowerDesc.includes('club') ||
            lowerDesc.includes('cinema') ||
            lowerDesc.includes('vibes')
          ) {
            cat = 'social';
          }

          results.push({
            amount: amt,
            category: cat,
            note: desc || 'Imported statement item',
            date: date,
            source: 'csv',
          });
        }
      }

      if (results.length === 0) {
        setCsvError('Could not find valid amounts. Format: Date, Description, Amount (ZAR)');
      } else {
        setParsedItems(results);
      }
    } catch (err: any) {
      setCsvError('Error parsing CSV file.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      handleParseCsv(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border flex flex-col max-h-[90vh] overflow-y-auto ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-emerald-100 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              ⚡
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">Log Expense</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Fast 3-tap tracking in Rands (ZAR)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl p-1 bg-slate-100 dark:bg-slate-800 mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('3tap')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === '3tap'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3-Tap Fast Log</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('csv')}
            className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'csv'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Statement CSV</span>
          </button>
        </div>

        {/* 3-TAP LOGGING TAB */}
        {activeTab === '3tap' && (
          <form onSubmit={handleQuickSubmit} className="space-y-5">
            {/* Tap 1: Amount */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                1. Select or Enter Amount (R)
              </label>

              {/* Amount Quick Chips */}
              <div className="grid grid-cols-5 gap-1.5 mb-2.5">
                {AMOUNT_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      Number(amount) === preset
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    R{preset}
                  </button>
                ))}
              </div>

              {/* Custom Amount Input */}
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-base">
                  R
                </span>
                <input
                  type="number"
                  step="any"
                  min="0.5"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl font-mono text-xl font-black border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Tap 2: Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                2. Tap Category
              </label>

              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((catKey) => {
                  const meta = CATEGORY_META[catKey];
                  const isSelected = category === catKey;
                  return (
                    <button
                      key={catKey}
                      type="button"
                      onClick={() => setCategory(catKey)}
                      className={`p-2.5 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500'
                          : isDark
                          ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800 text-slate-300'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xl">{meta.icon}</span>
                      <span className="text-xs font-semibold leading-tight">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Optional note (e.g. "Tuckshop pie", "Campus taxi")
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Where did it go?"
                className={`w-full px-3 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark
                    ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500'
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                }`}
              />
            </div>

            {/* Tap 3: Submit */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Log {formatZar(Number(amount) || 0)} Now</span>
            </button>
          </form>
        )}

        {/* CSV STATEMENT UPLOAD TAB */}
        {activeTab === 'csv' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Export your bank statement CSV from <strong>Capitec, FNB, Standard Bank, Nedbank, or TymeBank</strong> and upload it here. No bank login required.
            </p>

            {/* File Drag/Upload Box */}
            <label
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors block ${
                isDark
                  ? 'border-slate-700 hover:border-emerald-500 bg-slate-800/40'
                  : 'border-slate-300 hover:border-emerald-500 bg-slate-50'
              }`}
            >
              <FileText className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Tap to upload bank statement .csv
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Processed locally on your device (POPIA protected)</p>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {csvError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {/* Parsed List Preview */}
            {parsedItems.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>Found {parsedItems.length} transactions:</span>
                  <span className="text-emerald-500 font-mono">
                    Total: {formatZar(parsedItems.reduce((s, i) => s + i.amount, 0))}
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {parsedItems.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-2 rounded-lg text-xs flex items-center justify-between border ${
                        isDark ? 'bg-slate-800/60 border-slate-750' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span>{CATEGORY_META[item.category].icon}</span>
                        <span className="truncate">{item.note}</span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatZar(item.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onBatchAddExpenses(parsedItems);
                    setParsedItems([]);
                    onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  Import {parsedItems.length} Expenses into MoneyMate
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

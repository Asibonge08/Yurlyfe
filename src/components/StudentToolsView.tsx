/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  TextbookComparison, 
  MealBudgetPlan 
} from '../types';
import { TEXTBOOK_PRESETS, MEAL_PLANS } from '../data/initialData';
import { formatZar } from '../utils/calculations';
import { 
  BookOpen, 
  Users, 
  Utensils, 
  Copy, 
  Check, 
  Search, 
  Share2, 
  ShoppingBag, 
  Lightbulb, 
  Flame 
} from 'lucide-react';

interface StudentToolsViewProps {
  theme: 'dark' | 'light';
  userName: string;
}

export const StudentToolsView: React.FC<StudentToolsViewProps> = ({
  theme,
  userName,
}) => {
  const [activeTool, setActiveTool] = useState<'textbooks' | 'splitbill' | 'meals'>('textbooks');
  const isDark = theme === 'dark';

  // 1. TEXTBOOK COMPARISON STATE
  const [selectedBook, setSelectedBook] = useState<TextbookComparison>(TEXTBOOK_PRESETS[0]);
  const [customNewPrice, setCustomNewPrice] = useState<number | string>(750);
  const [customSecondHandPrice, setCustomSecondHandPrice] = useState<number | string>(260);

  // 2. SPLIT BILL STATE
  const [billAmount, setBillAmount] = useState<number | string>(360);
  const [peopleCount, setPeopleCount] = useState<number>(4);
  const [tipPercent, setTipPercent] = useState<number>(10);
  const [copiedWhatsApp, setCopiedWhatsApp] = useState(false);

  // 3. MEAL PLANNER STATE
  const [selectedTier, setSelectedTier] = useState<'tight' | 'balanced'>('tight');
  const activeMealPlan = MEAL_PLANS.find((m) => m.tier === selectedTier) || MEAL_PLANS[0];

  // Bill calculations
  const numericBill = Number(billAmount) || 0;
  const tipAmount = (numericBill * tipPercent) / 100;
  const totalWithTip = numericBill + tipAmount;
  const perPerson = peopleCount > 0 ? totalWithTip / peopleCount : 0;

  const handleCopyWhatsApp = () => {
    const text = `Hey guys! 🧾 Total was ${formatZar(totalWithTip)} (${formatZar(numericBill)} + ${tipPercent}% tip).\nThat's ${formatZar(perPerson)} per person for ${peopleCount} of us.\nPlease Capitec / FNB eWallet / transfer to ${userName || 'me'}! Cheers 🙏`;
    navigator.clipboard.writeText(text);
    setCopiedWhatsApp(true);
    setTimeout(() => setCopiedWhatsApp(false), 2500);
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-3">
      {/* Tool Selector Tabs */}
      <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold">
        <button
          onClick={() => setActiveTool('textbooks')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTool === 'textbooks'
              ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Textbooks</span>
        </button>

        <button
          onClick={() => setActiveTool('splitbill')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTool === 'splitbill'
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Split-Bill</span>
        </button>

        <button
          onClick={() => setActiveTool('meals')}
          className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTool === 'meals'
              ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-slate-500'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Res Meals</span>
        </button>
      </div>

      {/* TOOL 1: TEXTBOOK VS SECOND-HAND COMPARATOR */}
      {activeTool === 'textbooks' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div
            className={`p-4 rounded-3xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">📚</span>
              <div>
                <h3 className="font-bold text-sm">Textbook vs 2nd-Hand Saver</h3>
                <p className="text-[11px] text-slate-400">Never pay retail bookstore price unless required</p>
              </div>
            </div>

            {/* Presets Dropdown */}
            <div className="mt-3">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Select Prescribed Course Book
              </label>
              <select
                value={selectedBook.id}
                onChange={(e) => {
                  const b = TEXTBOOK_PRESETS.find((p) => p.id === e.target.value);
                  if (b) setSelectedBook(b);
                }}
                className={`w-full p-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                {TEXTBOOK_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.courseCode} - {p.bookTitle.slice(0, 32)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Comparison Card */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div
                className={`p-3 rounded-2xl border text-center ${
                  isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="text-[10px] text-slate-400 uppercase font-bold block">New Retail</span>
                <span className="text-lg font-black font-mono text-slate-500 line-through">
                  {formatZar(selectedBook.newPrice)}
                </span>
                <span className="text-[9px] text-slate-400 block mt-0.5">Campus bookstore</span>
              </div>

              <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-center">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-bold block">
                  Second-Hand / Swap
                </span>
                <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatZar(selectedBook.secondHandPrice)}
                </span>
                <span className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 font-bold block mt-0.5">
                  Save {formatZar(selectedBook.newPrice - selectedBook.secondHandPrice)} (
                  {Math.round(((selectedBook.newPrice - selectedBook.secondHandPrice) / selectedBook.newPrice) * 100)}%)
                </span>
              </div>
            </div>

            {/* Where to find note */}
            <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Where to find this:</span>
              </div>
              <p className="text-[11px] leading-relaxed">{selectedBook.whereToFind}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 italic">
                📖 Library Reserve: {selectedBook.libraryReserveNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: SPLIT-BILL CALCULATOR */}
      {activeTool === 'splitbill' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div
            className={`p-4 rounded-3xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🍕</span>
              <div>
                <h3 className="font-bold text-sm">Res & Digs Bill Splitter</h3>
                <p className="text-[11px] text-slate-400">Even split for takeaways, groceries, or Bolt rides</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Total Bill Input */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Total Bill Amount (R)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                    R
                  </span>
                  <input
                    type="number"
                    min="1"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className={`w-full pl-8 pr-3 py-2.5 rounded-xl font-mono text-lg font-bold border focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Number of People: <strong className="text-slate-900 dark:text-white">{peopleCount}</strong>
                </label>
                <div className="flex items-center gap-2">
                  {[2, 3, 4, 5, 6].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setPeopleCount(num)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        peopleCount === num
                          ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-300'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tip Selection */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Tip to Waiter / Driver: <strong className="text-slate-900 dark:text-white">{tipPercent}%</strong> ({formatZar(tipAmount)})
                </label>
                <div className="flex items-center gap-2">
                  {[0, 10, 15, 20].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTipPercent(t)}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        tipPercent === t
                          ? 'bg-slate-700 border-slate-700 text-white dark:bg-slate-600'
                          : isDark
                          ? 'bg-slate-800 border-slate-700 text-slate-400'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {t === 0 ? 'No tip' : `${t}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Per Person */}
              <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white text-center shadow-lg shadow-blue-500/20 my-2">
                <span className="text-[11px] font-semibold text-blue-100 uppercase tracking-wider block">
                  Each Person Owes
                </span>
                <span className="text-4xl font-black font-mono block my-1">
                  {formatZar(perPerson)}
                </span>
                <span className="text-[11px] text-blue-100">
                  Total with tip: {formatZar(totalWithTip)}
                </span>
              </div>

              {/* WhatsApp Copy Button */}
              <button
                type="button"
                onClick={handleCopyWhatsApp}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                {copiedWhatsApp ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied WhatsApp Message!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Breakdown for WhatsApp Group</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: CHEAPEST WAY TO EAT THIS WEEK MEAL PLANNER */}
      {activeTool === 'meals' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div
            className={`p-4 rounded-3xl border ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍲</span>
                <div>
                  <h3 className="font-bold text-sm">Student Meal Budget Survival</h3>
                  <p className="text-[11px] text-slate-400">Nutritious, high-energy meals for exams</p>
                </div>
              </div>
            </div>

            {/* Budget Tier Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedTier('tight')}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  selectedTier === 'tight'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/40 text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-xs block">The Res Survivor</span>
                <span className="text-[11px] font-mono">R140 / week</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedTier('balanced')}
                className={`p-2.5 rounded-2xl border text-center transition-all ${
                  selectedTier === 'balanced'
                    ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500'
                    : isDark
                    ? 'border-slate-800 bg-slate-800/40 text-slate-400'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <span className="text-xs block">Balanced Digs Feast</span>
                <span className="text-[11px] font-mono">R240 / week</span>
              </button>
            </div>

            {/* Grocery Staples Shopping List */}
            <div className="mb-4">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Grocery Essentials Checklist</span>
                <span className="text-emerald-500 font-mono">
                  Est: {formatZar(activeMealPlan.weeklyBudgetZar)}
                </span>
              </h4>

              <div className="space-y-1.5">
                {activeMealPlan.staples.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-slate-800/50 border-slate-750' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-[10px] text-slate-400 block">{item.store}</span>
                    </div>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatZar(item.estPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Schedule Preview */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Daily Meal Schedule
              </h4>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeMealPlan.mealSchedule.map((day, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs ${
                      isDark ? 'bg-slate-800/40 border-slate-800' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="font-bold text-slate-900 dark:text-white mb-0.5">{day.day}</div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      <strong>Lunch:</strong> {day.lunch} • <strong>Dinner:</strong> {day.dinner}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      <span>{day.quickTip}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserProfile, 
  IncomeSource, 
  FixedCost, 
  SavingsGoal 
} from '../types';
import { SA_UNIVERSITIES, SA_INSTITUTION_GROUPS, getNextPaydayDate } from '../data/initialData';
import { formatZar } from '../utils/calculations';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Wallet, 
  Home, 
  GraduationCap, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    user: Partial<UserProfile>;
    incomes: IncomeSource[];
    fixedCosts: FixedCost[];
    savingsGoals: SavingsGoal[];
  }) => void;
  initialUser: UserProfile;
  theme: 'dark' | 'light';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  initialUser,
  theme,
}) => {
  const [step, setStep] = useState<number>(1);
  const isDark = theme === 'dark';

  // Step 1: Student info
  const [name, setName] = useState(initialUser.name || 'Thabo');
  const [institution, setInstitution] = useState(initialUser.institution || SA_UNIVERSITIES[0]);
  const [livingType, setLivingType] = useState<'res' | 'digs' | 'home'>(initialUser.livingType || 'res');
  const [currentBalance, setCurrentBalance] = useState<number | string>(initialUser.currentBalance || 1200);

  // Step 2: Income sources
  const [incomeType, setIncomeType] = useState<'nsfas' | 'bursary' | 'parents' | 'part_time'>('nsfas');
  const [incomeAmount, setIncomeAmount] = useState<number | string>(1650);
  const [nextPayDate, setNextPayDate] = useState<string>(getNextPaydayDate(12));

  // Step 3: Fixed costs
  const [rentCost, setRentCost] = useState<number | string>(livingType === 'home' ? 0 : 300);
  const [transportCost, setTransportCost] = useState<number | string>(280);
  const [dataCost, setDataCost] = useState<number | string>(149);

  // Step 4: Savings goal
  const [goalName, setGoalName] = useState('Emergency Res Buffer');
  const [goalTarget, setGoalTarget] = useState<number | string>(500);

  if (!isOpen) return null;

  const handleFinish = () => {
    const numBalance = Number(currentBalance) || 1200;
    const numIncome = Number(incomeAmount) || 1650;
    const numRent = Number(rentCost) || 0;
    const numTransport = Number(transportCost) || 0;
    const numData = Number(dataCost) || 0;
    const numGoal = Number(goalTarget) || 500;

    const incomeName =
      incomeType === 'nsfas'
        ? 'NSFAS Monthly Allowance'
        : incomeType === 'bursary'
        ? 'Bursary Stipend'
        : incomeType === 'parents'
        ? 'Parents Allowance'
        : 'Part-Time Job / Tutoring';

    const newIncomes: IncomeSource[] = [
      {
        id: 'inc-' + Date.now(),
        name: incomeName,
        amount: numIncome,
        nextPayDate: nextPayDate,
        isPrimary: true,
      },
    ];

    const newFixedCosts: FixedCost[] = [];
    if (numRent > 0) {
      newFixedCosts.push({
        id: 'fc-rent',
        name: livingType === 'res' ? 'Res Meal / Accommodation Fee' : 'Digs Rent Contribution',
        amount: numRent,
        category: 'rent',
        dueDate: nextPayDate,
        isPaid: false,
      });
    }
    if (numTransport > 0) {
      newFixedCosts.push({
        id: 'fc-transport',
        name: 'Campus Commute (Taxi / Bus)',
        amount: numTransport,
        category: 'transport',
        dueDate: getNextPaydayDate(5),
        isPaid: false,
      });
    }
    if (numData > 0) {
      newFixedCosts.push({
        id: 'fc-data',
        name: 'Student Mobile Data Bundle (MTN/Vodacom)',
        amount: numData,
        category: 'data',
        dueDate: getNextPaydayDate(8),
        isPaid: false,
      });
    }

    const newGoals: SavingsGoal[] = [
      {
        id: 'sav-' + Date.now(),
        name: goalName,
        targetAmount: numGoal,
        currentSaved: Math.round(numGoal * 0.25),
        targetDate: getNextPaydayDate(30),
      },
    ];

    onComplete({
      user: {
        name,
        institution,
        livingType,
        currentBalance: numBalance,
        onboardingCompleted: true,
      },
      incomes: newIncomes,
      fixedCosts: newFixedCosts,
      savingsGoals: newGoals,
    });
  };

  // Preview Safe-To-Spend
  const previewDays = 12;
  const totalUnpaid = (Number(rentCost) || 0) + (Number(transportCost) || 0) + (Number(dataCost) || 0);
  const previewSafe = Math.max(0, (Number(currentBalance) || 0) - totalUnpaid) / previewDays;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-3xl p-6 shadow-2xl border flex flex-col max-h-[92vh] overflow-y-auto ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-emerald-100 text-slate-900'
        }`}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>Setup in under 2 mins</span>
            <span className="text-emerald-500">Step {step} of 4</span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* STEP 1: STUDENT PROFILE */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="font-black text-xl mb-1">Welcome to MoneyMate 👋</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Let's customize your coach for your university and digs/res life.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Your First Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Thabo, Zanele, Dylan"
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                University or College
              </label>
              <select
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              >
                {SA_INSTITUTION_GROUPS.map((group) => (
                  <optgroup key={group.category} label={group.category}>
                    {group.institutions.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Where do you live?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'res', label: 'On Res', icon: '🏢' },
                  { id: 'digs', label: 'Digs / Comm', icon: '🏡' },
                  { id: 'home', label: 'At Home', icon: '🛋️' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setLivingType(type.id as any)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      livingType === type.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500'
                        : isDark
                        ? 'border-slate-800 bg-slate-800/40 text-slate-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="text-xl block mb-1">{type.icon}</span>
                    <span className="text-xs font-semibold">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Current Bank Balance Right Now (R)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                  R
                </span>
                <input
                  type="number"
                  min="0"
                  value={currentBalance}
                  onChange={(e) => setCurrentBalance(e.target.value)}
                  placeholder="1200"
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl text-base font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <span>Next: Income & Paydays</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: INCOME & PAYDAY */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="font-black text-xl mb-1">Income & Paydays 💸</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Students get irregular money on different dates. When do you get paid next?
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Primary Income Source
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'nsfas', label: 'NSFAS Allowance', defaultAmt: 1650 },
                  { id: 'bursary', label: 'Bursary / Scholarship', defaultAmt: 2500 },
                  { id: 'parents', label: 'Family Transfer', defaultAmt: 800 },
                  { id: 'part_time', label: 'Part-Time Job / Tutoring', defaultAmt: 1200 },
                ].map((inc) => (
                  <button
                    key={inc.id}
                    type="button"
                    onClick={() => {
                      setIncomeType(inc.id as any);
                      setIncomeAmount(inc.defaultAmt);
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      incomeType === inc.id
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold ring-1 ring-emerald-500'
                        : isDark
                        ? 'border-slate-800 bg-slate-800/40 text-slate-300'
                        : 'border-slate-200 bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="block leading-tight font-bold">{inc.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">~R{inc.defaultAmt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Expected Amount (R)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                  R
                </span>
                <input
                  type="number"
                  min="0"
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl font-mono text-base font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Next Payday / Allowance Date
              </label>
              <input
                type="date"
                required
                value={nextPayDate}
                onChange={(e) => setNextPayDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <span>Next: Fixed Essentials</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: FIXED COSTS */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="font-black text-xl mb-1">Fixed Costs & Bills 🔒</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                We safeguard these from your daily spend so you never get evicted or stranded without data.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                {livingType === 'res' ? 'Res Meal / Accommodation Fee (R)' : 'Digs Rent Contribution (R)'}
              </label>
              <input
                type="number"
                min="0"
                value={rentCost}
                onChange={(e) => setRentCost(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl font-mono text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Transport / Minibus Taxi / Bus (R)
              </label>
              <input
                type="number"
                min="0"
                value={transportCost}
                onChange={(e) => setTransportCost(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl font-mono text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Data & Airtime Monthly Pack (R)
              </label>
              <input
                type="number"
                min="0"
                value={dataCost}
                onChange={(e) => setDataCost(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl font-mono text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(4)}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <span>Next: Savings Goal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SAVINGS GOAL & INSTANT REVEAL */}
        {step === 4 && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div>
              <h3 className="font-black text-xl mb-1">Goal & Safe-To-Spend 🎯</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A small cushion prevents month-end panic during exam load shedding or clinic visits.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Goal Name
              </label>
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="e.g. Res Emergency Buffer, Bus home"
                className={`w-full px-3.5 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Target Buffer Amount (R)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                  R
                </span>
                <input
                  type="number"
                  min="50"
                  value={goalTarget}
                  onChange={(e) => setGoalTarget(e.target.value)}
                  className={`w-full pl-8 pr-3.5 py-2 rounded-xl font-mono text-sm font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* INSTANT PREVIEW REVEAL */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white text-center shadow-lg shadow-emerald-500/20">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
                Calculated Safe-To-Spend
              </span>
              <span className="text-4xl font-black font-mono block my-1">
                {formatZar(previewSafe, false)}
                <span className="text-sm font-normal"> / day</span>
              </span>
              <span className="text-[11px] text-emerald-100">
                You can spend this daily until your next payday without running dry!
              </span>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <Check className="w-4 h-4" />
                <span>Launch MoneyMate Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

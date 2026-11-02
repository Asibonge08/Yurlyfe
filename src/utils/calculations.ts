/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  UserProfile,
  IncomeSource,
  FixedCost,
  SavingsGoal,
  ExpenseItem,
  SafeToSpendMetrics,
  MoneyLeak,
  WeeklySummary,
  ExpenseCategory,
  WeeklyChallenge,
  BudgetThresholdNotification,
  InAppNotification,
} from '../types';

/**
 * Format a number to South African Rand (ZAR) string
 */
export const formatZar = (amount: number, includeDecimals: boolean = true): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return 'R0.00';
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-ZA', {
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  });
  return amount < 0 ? `-R${formatted}` : `R${formatted}`;
};

/**
 * Calculate difference in days between two dates
 */
export const getDaysDifference = (targetDateStr: string): number => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const target = new Date(targetDateStr);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDays); // At least 1 day
};

/**
 * Core MoneyMate Engine: Calculate Safe-to-Spend number & Month-end survival pacing
 */
export const calculateSafeToSpend = (
  user: UserProfile,
  incomes: IncomeSource[],
  fixedCosts: FixedCost[],
  savingsGoals: SavingsGoal[],
  expenses: ExpenseItem[]
): SafeToSpendMetrics => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Find the primary or nearest upcoming payday
  const sortedIncomes = [...incomes].sort(
    (a, b) => new Date(a.nextPayDate).getTime() - new Date(b.nextPayDate).getTime()
  );

  const upcomingIncomes = sortedIncomes.filter((inc) => inc.nextPayDate >= todayStr);
  const nextIncome = upcomingIncomes.length > 0 ? upcomingIncomes[0] : sortedIncomes[0];

  const nextPaydayDate = nextIncome ? nextIncome.nextPayDate : todayStr;
  const nextPaydaySource = nextIncome ? nextIncome.name : 'Next Payday';
  const expectedNextIncome = nextIncome ? nextIncome.amount : 0;

  const daysUntilNextPayday = getDaysDifference(nextPaydayDate);

  // Unpaid fixed costs due on or before next payday
  const unpaidFixedCosts = fixedCosts
    .filter((fc) => !fc.isPaid && fc.dueDate <= nextPaydayDate)
    .reduce((sum, fc) => sum + fc.amount, 0);

  // Modest savings reserve: protect a portion of emergency savings if not already secured
  const totalSavingsTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const currentSaved = savingsGoals.reduce((sum, g) => sum + g.currentSaved, 0);
  const savingsShortfall = Math.max(0, totalSavingsTarget - currentSaved);
  // Reserve ~5% of remaining balance or up to R100 for safety buffer
  const savingsAllocation = Math.min(savingsShortfall * 0.1, 100);

  // Available spendable pool for discretionary daily student living
  const availableSpendablePool = Math.max(
    0,
    user.currentBalance - unpaidFixedCosts - savingsAllocation
  );

  // Raw safe daily spend
  const dailySafeToSpend = Math.max(0, availableSpendablePool / daysUntilNextPayday);

  // Calculate actual recent burn rate (last 7 days of expenses)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentExpenses = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const totalRecentSpent = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
  const actualDailyBurnRate = Math.max(1, totalRecentSpent / 7);

  // Project how many days user's current balance will last at current burn rate
  const projectedRunOutDays = Math.floor(user.currentBalance / actualDailyBurnRate);
  const daysDeficit = Math.max(0, daysUntilNextPayday - projectedRunOutDays);
  const isAtRisk = daysDeficit > 0 && user.currentBalance < unpaidFixedCosts + (daysUntilNextPayday * 40);

  // Determine Risk Level & Survival Message
  let riskLevel: 'safe' | 'tight' | 'danger' = 'safe';
  let survivalMessage = '';

  if (dailySafeToSpend < 30 || daysDeficit >= 4 || user.currentBalance < unpaidFixedCosts) {
    riskLevel = 'danger';
    survivalMessage = `🚨 Survival Alert: At your recent pace of ${formatZar(
      actualDailyBurnRate,
      false
    )}/day, your cash may run out ${daysDeficit} days before ${nextPaydaySource} on ${formatDateShort(
      nextPaydayDate
    )}. Drop daily spend to ${formatZar(dailySafeToSpend, false)} to make it safely!`;
  } else if (actualDailyBurnRate > dailySafeToSpend * 1.25 || daysDeficit > 0) {
    riskLevel = 'tight';
    survivalMessage = `⚠️ Pacing Warning: You're spending ${formatZar(
      actualDailyBurnRate,
      false
    )}/day vs your safe limit of ${formatZar(
      dailySafeToSpend,
      false
    )}/day. Slow down a bit so you don't face a dry spell before next week.`;
  } else {
    riskLevel = 'safe';
    survivalMessage = `✨ On Track: You're pacing nicely! You have ${formatZar(
      dailySafeToSpend,
      false
    )}/day to spend safely across the next ${daysUntilNextPayday} days until ${nextPaydaySource}.`;
  }

  return {
    dailySafeToSpend,
    daysUntilNextPayday,
    nextPaydayDate,
    nextPaydaySource,
    expectedNextIncome,
    availableSpendablePool,
    actualDailyBurnRate,
    projectedRunOutDays,
    isAtRisk,
    daysDeficit,
    riskLevel,
    survivalMessage,
  };
};

/**
 * Format date nicely: "25 Nov"
 */
export const formatDateShort = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  } catch {
    return dateStr;
  }
};

/**
 * Category friendly names & icons
 */
export const CATEGORY_META: Record<
  ExpenseCategory,
  { label: string; icon: string; color: string; defaultTip: string }
> = {
  food: {
    label: 'Food & Meals',
    icon: '🍔',
    color: '#10b981', // emerald
    defaultTip: 'Campus tuckshops cost 2-3x homemade meals. Pack res lunch or pool with digs mates.',
  },
  transport: {
    label: 'Transport & Taxis',
    icon: '🚐',
    color: '#3b82f6', // blue
    defaultTip: 'Use student bus passes (MyCiTi/Rea Vaya) or share Bolt/taxi rides with coursemates.',
  },
  data: {
    label: 'Data & Airtime',
    icon: '📶',
    color: '#8b5cf6', // purple
    defaultTip: 'Download lecture slides and YouTube revision videos while on free campus eduroam WiFi.',
  },
  books: {
    label: 'Books & Supplies',
    icon: '📚',
    color: '#f59e0b', // amber
    defaultTip: 'Check university 2-hour library reserve or student WhatsApp groups before buying brand new.',
  },
  social: {
    label: 'Social & Vibes',
    icon: '🎉',
    color: '#ec4899', // pink
    defaultTip: 'Host a res games night or bring your own cool drinks instead of high pub markups.',
  },
  other: {
    label: 'Other & Essentials',
    icon: '🏷️',
    color: '#64748b', // slate
    defaultTip: 'Keep an eye on small incidental cash withdrawals—they quickly add up.',
  },
};

/**
 * Generate Weekly Summary: Top 3 Money Leaks + Challenge
 */
export const generateWeeklySummary = (
  expenses: ExpenseItem[],
  existingChallenge: WeeklyChallenge
): WeeklySummary => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekExpenses = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const totalSpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryTotals: Record<ExpenseCategory, number> = {
    food: 0,
    transport: 0,
    data: 0,
    books: 0,
    social: 0,
    other: 0,
  };

  weekExpenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Sort and pick top 3 leaks
  const topLeaks: MoneyLeak[] = (Object.keys(categoryTotals) as ExpenseCategory[])
    .filter((cat) => categoryTotals[cat] > 0)
    .sort((a, b) => categoryTotals[b] - categoryTotals[a])
    .slice(0, 3)
    .map((cat) => {
      const spent = categoryTotals[cat];
      const pct = totalSpent > 0 ? Math.round((spent / totalSpent) * 100) : 0;
      return {
        category: cat,
        label: CATEGORY_META[cat].label,
        totalSpent: spent,
        percentageOfSpending: pct,
        insight: CATEGORY_META[cat].defaultTip,
      };
    });

  const now = new Date();
  const weekRange = `Past 7 Days (${formatDateShort(sevenDaysAgo.toISOString())} - ${formatDateShort(
    now.toISOString()
  )})`;

  return {
    weekRange,
    totalSpent,
    topLeaks,
    challenge: existingChallenge,
  };
};

/**
 * Check if the user's weekly spending exceeds the budget threshold (e.g., 80%)
 * Triggers an in-app alert when weekly spending exceeds the threshold percentage of calculated weekly budget.
 */
export const checkBudgetThreshold = (
  expenses: ExpenseItem[],
  dailySafeToSpend: number,
  thresholdPercent: number = 80
): BudgetThresholdNotification | null => {
  // Weekly spending over the past 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekExpenses = expenses.filter((e) => new Date(e.date) >= sevenDaysAgo);
  const weeklySpent = weekExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Weekly calculated budget = daily safe-to-spend * 7 (with a realistic floor of R50)
  const weeklyBudget = Math.max(50, Math.round(dailySafeToSpend * 7 * 100) / 100);
  const percentage = Math.round((weeklySpent / weeklyBudget) * 100);

  // Trigger alert if weekly spending meets or exceeds the threshold (e.g. 80%)
  if (percentage >= thresholdPercent) {
    const isOverBudget = percentage >= 100;
    const excessAmount = Math.max(0, weeklySpent - (weeklyBudget * (thresholdPercent / 100)));

    let title = '';
    let message = '';
    let suggestedAction = '';

    if (isOverBudget) {
      title = `🚨 Weekly Budget Exceeded (${percentage}%)`;
      message = `You've spent ${formatZar(weeklySpent)} this week, passing 100% of your calculated ${formatZar(
        weeklyBudget
      )} weekly budget by ${formatZar(weeklySpent - weeklyBudget)}. Slow down your daily burn rate now to protect next week's allowance!`;
      suggestedAction = 'Cut discretionary social and takeaway spending for the next 3 days.';
    } else {
      title = `⚠️ 80% Budget Threshold Reached (${percentage}%)`;
      message = `Caution! You've reached ${percentage}% of your weekly budget (${formatZar(
        weeklySpent
      )} spent of ${formatZar(weeklyBudget)}). Only ${formatZar(
        weeklyBudget - weeklySpent
      )} remains to spend safely before this week resets.`;
      suggestedAction = 'Stick strictly to res groceries or campus meals to finish the week safely.';
    }

    return {
      id: `alert-budget-${Math.floor(weeklySpent)}-${percentage}`,
      title,
      message,
      weeklySpent,
      weeklyBudget,
      percentage,
      thresholdPercent,
      urgency: isOverBudget ? 'critical' : 'warning',
      triggeredAt: new Date().toISOString(),
      excessAmount,
      suggestedAction,
    };
  }

  return null;
};

/**
 * Check for subscriptions or fixed costs due within 5 days (as required for student allowance alerts)
 */
export const checkSubscriptionDueAlerts = (
  fixedCosts: FixedCost[]
): InAppNotification[] => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const notifications: InAppNotification[] = [];

  fixedCosts
    .filter((fc) => !fc.isPaid)
    .forEach((fc) => {
      const dueDate = new Date(fc.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Trigger notification if due in 5 days or fewer (and not in the past)
      if (diffDays >= 0 && diffDays <= 5) {
        notifications.push({
          id: `sub-due-${fc.id}-${fc.dueDate}`,
          type: 'subscription_due',
          title: diffDays === 0 ? `🚨 Due Today: ${fc.name}` : `📅 Due in ${diffDays} day${diffDays === 1 ? '' : 's'}: ${fc.name}`,
          message: `${fc.name} (${formatZar(fc.amount)}) is scheduled for payment on ${formatDateShort(
            fc.dueDate
          )}. Ensure you have funds reserved in your bank account!`,
          timestamp: new Date().toISOString(),
          read: false,
          urgency: diffDays <= 2 ? 'warning' : 'info',
          metadata: {
            subscriptionName: fc.name,
            dueDate: fc.dueDate,
            amount: fc.amount,
          },
        });
      }
    });

  return notifications;
};


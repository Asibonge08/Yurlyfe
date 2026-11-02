/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ExpenseCategory = 'food' | 'transport' | 'data' | 'books' | 'social' | 'other';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  institution: string; // e.g. UCT, Wits, UP, UJ, Stellenbosch, TUT, UKZN, etc.
  livingType: 'res' | 'digs' | 'home';
  currentBalance: number; // in ZAR
  isPremium: boolean;
  referralCodeUsed?: string;
  onboardingCompleted: boolean;
  popiaConsentGiven: boolean;
  popiaConsentDate?: string;
  theme: 'dark' | 'light';
  dailyCoachQueriesCount: number;
  lastCoachQueryDate?: string;
}

export interface IncomeSource {
  id: string;
  name: string; // e.g. 'NSFAS Allowance', 'Parents Allowance', 'Part-time Tutoring', 'Bursary'
  amount: number; // in ZAR
  nextPayDate: string; // YYYY-MM-DD
  isPrimary: boolean;
}

export interface FixedCost {
  id: string;
  name: string; // e.g. 'Digs Rent', 'Taxi Fare / Train', 'Data / WiFi', 'Campus Laundry'
  amount: number; // in ZAR
  category: 'rent' | 'transport' | 'data' | 'other';
  dueDate: string; // YYYY-MM-DD
  isPaid: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string; // e.g. 'Emergency Res Buffer', 'December Travel Home', 'Laptop Fund'
  targetAmount: number; // in ZAR
  currentSaved: number; // in ZAR
  targetDate?: string;
  icon?: string;
  category?: string;
}

export interface ExpenseItem {
  id: string;
  amount: number; // in ZAR
  category: ExpenseCategory;
  note?: string;
  date: string; // YYYY-MM-DDTHH:mm:ss
  source: 'manual' | 'csv';
}

export interface SafeToSpendMetrics {
  dailySafeToSpend: number;
  daysUntilNextPayday: number;
  nextPaydayDate: string;
  nextPaydaySource: string;
  expectedNextIncome: number;
  availableSpendablePool: number;
  actualDailyBurnRate: number;
  projectedRunOutDays: number;
  isAtRisk: boolean;
  daysDeficit: number;
  riskLevel: 'safe' | 'tight' | 'danger';
  survivalMessage: string;
}

export interface MoneyLeak {
  category: ExpenseCategory;
  label: string;
  totalSpent: number;
  percentageOfSpending: number;
  insight: string;
}

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  potentialSavings: number;
  targetDays: number;
  completed: boolean;
}

export interface WeeklySummary {
  weekRange: string;
  totalSpent: number;
  topLeaks: MoneyLeak[];
  challenge: WeeklyChallenge;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedPrompts?: string[];
}

export interface TextbookComparison {
  id: string;
  courseCode: string;
  bookTitle: string;
  newPrice: number;
  secondHandPrice: number;
  libraryReserveNotes: string;
  condition: 'Good' | 'Like New' | 'Fair';
  whereToFind: string;
}

export interface SplitBillState {
  title: string;
  totalAmount: number;
  peopleCount: number;
  tipPercent: number;
  includeTip: boolean;
  participantNames: string[];
}

export interface MealBudgetPlan {
  id: string;
  tier: 'tight' | 'balanced' | 'comfortable';
  title: string;
  weeklyBudgetZar: number;
  staples: { name: string; estPrice: number; unit: string; store: string }[];
  mealSchedule: { day: string; lunch: string; dinner: string; quickTip: string }[];
}

// Budget Threshold & In-App Notification Types
export interface BudgetThresholdNotification {
  id: string;
  title: string;
  message: string;
  weeklySpent: number;
  weeklyBudget: number;
  percentage: number;
  thresholdPercent: number;
  urgency: 'warning' | 'critical';
  triggeredAt: string;
  excessAmount: number;
  suggestedAction: string;
  isDismissed?: boolean;
}

export interface InAppNotification {
  id: string;
  type: 'budget_threshold' | 'subscription_due' | 'payday_countdown' | 'challenge_update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  urgency: 'info' | 'warning' | 'critical';
  metadata?: {
    spent?: number;
    budget?: number;
    percentage?: number;
    subscriptionName?: string;
    dueDate?: string;
    amount?: number;
  };
}

// 1. Task Manager & Schedule Types
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskCategory = 'academic' | 'errand' | 'finance' | 'personal';

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  courseCode?: string;
  estimatedMinutes?: number;
}

export type TimetableEventType = 'lecture' | 'tutorial' | 'lab' | 'study' | 'life' | 'exam';
export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface TimetableEvent {
  id: string;
  title: string;
  courseCode?: string;
  type: TimetableEventType;
  dayOfWeek: DayOfWeek;
  startTime: string; // HH:mm (e.g. "09:00")
  endTime: string; // HH:mm (e.g. "10:45")
  location: string;
  color: string;
  reminder?: boolean;
}

// 2. Google NotebookLM Clone Study Types
export type StudySourceType = 'pdf' | 'notes' | 'slides' | 'syllabus' | 'url';

export interface StudyMaterial {
  id: string;
  title: string;
  type: StudySourceType;
  courseCode: string;
  content: string;
  selected: boolean;
  dateAdded: string;
  wordCount: number;
  authorOrSpeaker?: string;
}

export interface RAGCitation {
  sourceId: string;
  sourceTitle: string;
  snippet: string;
}

export interface StudyChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: RAGCitation[];
  studyArtifactType?: 'study_guide' | 'quiz' | 'flashcards' | 'audio_overview';
}

export type ActiveNavTab = 'dashboard' | 'tasks' | 'study' | 'coach' | 'summary' | 'tools';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  UserProfile, 
  IncomeSource, 
  FixedCost, 
  SavingsGoal, 
  ExpenseItem, 
  ChatMessage, 
  WeeklyChallenge, 
  ActiveNavTab,
  TaskItem,
  TimetableEvent,
  StudyMaterial,
  StudyChatMessage
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_INCOMES, 
  INITIAL_FIXED_COSTS, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_EXPENSES, 
  INITIAL_CHALLENGE,
  INITIAL_TASKS,
  INITIAL_TIMETABLE_EVENTS,
  INITIAL_STUDY_MATERIALS,
  INITIAL_STUDY_CHAT
} from './data/initialData';
import { 
  calculateSafeToSpend, 
  generateWeeklySummary,
  checkBudgetThreshold,
  checkSubscriptionDueAlerts
} from './utils/calculations';

// Components
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TaskManagerView } from './components/TaskManagerView';
import { StudyNotebookLMView } from './components/StudyNotebookLMView';
import { CoachChatView } from './components/CoachChatView';
import { WeeklySummaryView } from './components/WeeklySummaryView';
import { StudentToolsView } from './components/StudentToolsView';
import { MobileNav } from './components/MobileNav';
import { QuickExpenseModal } from './components/QuickExpenseModal';
import { OnboardingModal } from './components/OnboardingModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { UpgradeModal } from './components/UpgradeModal';
import { BudgetThresholdAlert } from './components/BudgetThresholdAlert';
import { NotificationsModal } from './components/NotificationsModal';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Theme State (Dark & Light Mode)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_theme');
      return (saved as 'dark' | 'light') || 'dark';
    } catch {
      return 'dark';
    }
  });

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_user');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  // Income Sources
  const [incomes, setIncomes] = useState<IncomeSource[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_incomes');
      return saved ? JSON.parse(saved) : INITIAL_INCOMES;
    } catch {
      return INITIAL_INCOMES;
    }
  });

  // Fixed Costs
  const [fixedCosts, setFixedCosts] = useState<FixedCost[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_fixed_costs');
      return saved ? JSON.parse(saved) : INITIAL_FIXED_COSTS;
    } catch {
      return INITIAL_FIXED_COSTS;
    }
  });

  // Savings Goals (Multiple Goals supported with custom progress bars)
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_savings_goals');
      return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
    } catch {
      return INITIAL_SAVINGS_GOALS;
    }
  });

  // Expenses
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_expenses');
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  // Tasks & To-Do List
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  // Class Timetable & Life Events
  const [timetableEvents, setTimetableEvents] = useState<TimetableEvent[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_timetable');
      return saved ? JSON.parse(saved) : INITIAL_TIMETABLE_EVENTS;
    } catch {
      return INITIAL_TIMETABLE_EVENTS;
    }
  });

  // Google NotebookLM Study Materials
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_study_materials');
      return saved ? JSON.parse(saved) : INITIAL_STUDY_MATERIALS;
    } catch {
      return INITIAL_STUDY_MATERIALS;
    }
  });

  // Study RAG Chat Messages
  const [studyChatMessages, setStudyChatMessages] = useState<StudyChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_study_chat');
      return saved ? JSON.parse(saved) : INITIAL_STUDY_CHAT;
    } catch {
      return INITIAL_STUDY_CHAT;
    }
  });

  // Weekly Challenge
  const [challenge, setChallenge] = useState<WeeklyChallenge>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_challenge');
      return saved ? JSON.parse(saved) : INITIAL_CHALLENGE;
    } catch {
      return INITIAL_CHALLENGE;
    }
  });

  // AI Money Coach Chat Messages
  const [coachMessages, setCoachMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_coach_chat');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'msg-init-1',
        role: 'assistant',
        text: `Hey ${user.name}! 🇿🇦 I'm your yurlyfe AI Money Coach.\n\nI monitor your student allowances, daily safe-to-spend pace, and fixed costs so you never face a dry spell before month-end.\n\nAsk me anything about your numbers, weekend plans, or meal-prep tips!`,
        timestamp: 'Just now',
      },
    ];
  });

  const [initialCoachPrompt, setInitialCoachPrompt] = useState<string>('');

  // Modals & Notifications
  const [isQuickExpenseOpen, setIsQuickExpenseOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(!user.onboardingCompleted);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const [thresholdPercent, setThresholdPercent] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('yurlyfe_threshold_percent');
      return saved ? Number(saved) : 80;
    } catch {
      return 80;
    }
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('yurlyfe_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_incomes', JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_fixed_costs', JSON.stringify(fixedCosts));
  }, [fixedCosts]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_timetable', JSON.stringify(timetableEvents));
  }, [timetableEvents]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_study_materials', JSON.stringify(studyMaterials));
  }, [studyMaterials]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_study_chat', JSON.stringify(studyChatMessages));
  }, [studyChatMessages]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_coach_chat', JSON.stringify(coachMessages));
  }, [coachMessages]);

  useEffect(() => {
    localStorage.setItem('yurlyfe_challenge', JSON.stringify(challenge));
  }, [challenge]);

  // Derived Safe-To-Spend Metrics
  const metrics = useMemo(() => {
    return calculateSafeToSpend(user, incomes, fixedCosts, savingsGoals, expenses);
  }, [user, incomes, fixedCosts, savingsGoals, expenses]);

  // Derived Weekly Summary
  const weeklySummary = useMemo(() => {
    return generateWeeklySummary(expenses, challenge);
  }, [expenses, challenge]);

  // Derived Budget Threshold Notification (Triggers when weekly spend exceeds 80% of budget)
  const thresholdNotification = useMemo(() => {
    return checkBudgetThreshold(expenses, metrics.dailySafeToSpend, thresholdPercent);
  }, [expenses, metrics.dailySafeToSpend, thresholdPercent]);

  // Derived Subscriptions and Bills Due Within 5 Days
  const subscriptionAlerts = useMemo(() => {
    return checkSubscriptionDueAlerts(fixedCosts);
  }, [fixedCosts]);

  const totalAlertsCount = (thresholdNotification ? 1 : 0) + subscriptionAlerts.length;

  // 1. Task Handlers
  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (newTaskData: Omit<TaskItem, 'id'>) => {
    const newTask: TaskItem = {
      ...newTaskData,
      id: 'task-' + Date.now(),
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // 2. Timetable & Schedule Handlers
  const handleAddTimetableEvent = (newEventData: Omit<TimetableEvent, 'id'>) => {
    const newEvent: TimetableEvent = {
      ...newEventData,
      id: 'event-' + Date.now(),
    };
    setTimetableEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteTimetableEvent = (eventId: string) => {
    setTimetableEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  // 3. Study Materials & NotebookLM Handlers
  const handleAddStudyMaterial = (newMatData: Omit<StudyMaterial, 'id' | 'dateAdded'>) => {
    const newMat: StudyMaterial = {
      ...newMatData,
      id: 'mat-' + Date.now(),
      dateAdded: 'Just now',
    };
    setStudyMaterials((prev) => [newMat, ...prev]);
  };

  const handleToggleStudyMaterial = (id: string) => {
    setStudyMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m))
    );
  };

  const handleDeleteStudyMaterial = (id: string) => {
    setStudyMaterials((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSendStudyMessage = async (
    text: string,
    action?: 'study_guide' | 'quiz' | 'flashcards'
  ) => {
    const userDisplay = action
      ? action === 'study_guide'
        ? 'Generate Study Guide from selected materials'
        : action === 'quiz'
        ? 'Quiz me on selected materials'
        : 'Generate flashcards from selected materials'
      : text;

    const userMsg: StudyChatMessage = {
      id: 'smsg-' + Date.now(),
      role: 'user',
      text: userDisplay,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setStudyChatMessages((prev) => [...prev, userMsg]);

    const activeSources = studyMaterials.filter((m) => m.selected);

    try {
      const response = await fetch('/api/study/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          action,
          history: studyChatMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          sources: activeSources,
        }),
      });

      const data = await response.json();
      const botMsg: StudyChatMessage = {
        id: 'smsg-' + (Date.now() + 1),
        role: 'assistant',
        text: data.reply || "Synthesized based on your uploaded study documents.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        studyArtifactType: action,
      };

      setStudyChatMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Study RAG error:', err);
      const fallbackMsg: StudyChatMessage = {
        id: 'smsg-err-' + Date.now(),
        role: 'assistant',
        text: "I was unable to connect to the study server. Make sure your local server is running and try again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setStudyChatMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  // 4. Savings Goal Progress Bar Updates
  const handleUpdateSavingsGoal = (goalId: string, addedAmount: number) => {
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id === goalId) {
          const nextSaved = g.currentSaved + addedAmount;
          return { ...g, currentSaved: nextSaved };
        }
        return g;
      })
    );

    // Also deduct deposited amount from student bank balance
    setUser((prev) => ({
      ...prev,
      currentBalance: Math.max(0, prev.currentBalance - addedAmount),
    }));
  };

  const handleAddSavingsGoal = (newGoalData: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...newGoalData,
      id: 'sav-' + Date.now(),
    };
    setSavingsGoals((prev) => [...prev, newGoal]);
  };

  // 5. Expense Handlers
  const handleAddExpense = (newExpData: Omit<ExpenseItem, 'id' | 'date'>) => {
    const newExp: ExpenseItem = {
      ...newExpData,
      id: 'exp-' + Date.now(),
      date: new Date().toISOString(),
    };

    setExpenses((prev) => [newExp, ...prev]);

    // Deduct from bank balance
    setUser((prev) => ({
      ...prev,
      currentBalance: Math.max(0, prev.currentBalance - newExpData.amount),
    }));
  };

  const handleBatchAddExpenses = (items: Omit<ExpenseItem, 'id'>[]) => {
    const fullItems: ExpenseItem[] = items.map((it, idx) => ({
      ...it,
      id: 'exp-batch-' + Date.now() + '-' + idx,
    }));

    const totalBatch = items.reduce((sum, it) => sum + it.amount, 0);

    setExpenses((prev) => [...fullItems, ...prev]);
    setUser((prev) => ({
      ...prev,
      currentBalance: Math.max(0, prev.currentBalance - totalBatch),
    }));
  };

  const handleDeleteExpense = (id: string) => {
    const exp = expenses.find((e) => e.id === id);
    if (!exp) return;

    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setUser((prev) => ({
      ...prev,
      currentBalance: prev.currentBalance + exp.amount,
    }));
  };

  const handleToggleFixedCostPaid = (id: string) => {
    setFixedCosts((prev) =>
      prev.map((fc) => (fc.id === id ? { ...fc, isPaid: !fc.isPaid } : fc))
    );
  };

  // 6. Coach Chat Handler
  const handleSendCoachMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setCoachMessages((prev) => [...prev, userMsg]);

    const studentContext = {
      name: user.name,
      institution: user.institution,
      livingType: user.livingType,
      currentBalance: user.currentBalance,
      dailySafeToSpend: metrics.dailySafeToSpend,
      daysUntilNextPayday: metrics.daysUntilNextPayday,
      nextPaydaySource: metrics.nextPaydaySource,
      actualDailyBurnRate: metrics.actualDailyBurnRate,
      riskLevel: metrics.riskLevel,
      topLeaks: weeklySummary.topLeaks.map((l) => ({ category: l.label, spent: l.totalSpent })),
      recentExpenses: expenses.slice(0, 8).map((e) => ({ category: e.category, amount: e.amount, note: e.note })),
    };

    try {
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: coachMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          studentContext,
        }),
      });

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: 'msg-' + (Date.now() + 1),
        role: 'assistant',
        text: data.reply || "Let's check your safe-to-spend number together!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCoachMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error('Coach API error:', err);
      const fallbackMsg: ChatMessage = {
        id: 'msg-err-' + Date.now(),
        role: 'assistant',
        text: `Hey ${user.name}, I had a quick network hiccup, but here's your immediate rule of thumb: keep daily spending under R${Math.round(
          metrics.dailySafeToSpend
        )} to make it smoothly to your ${metrics.nextPaydaySource}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setCoachMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  const handleOpenCoachWithPrompt = (prompt: string) => {
    setInitialCoachPrompt(prompt);
    setActiveTab('coach');
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleWipeAllData = () => {
    localStorage.clear();
    setUser({
      ...INITIAL_USER,
      currentBalance: 0,
      onboardingCompleted: false,
    });
    setIncomes([]);
    setFixedCosts([]);
    setSavingsGoals([]);
    setExpenses([]);
    setTasks([]);
    setTimetableEvents([]);
    setStudyMaterials([]);
    setStudyChatMessages([]);
    setCoachMessages([]);
    setIsOnboardingOpen(true);
  };

  const handleOnboardingComplete = (data: {
    user: Partial<UserProfile>;
    incomes: IncomeSource[];
    fixedCosts: FixedCost[];
    savingsGoals: SavingsGoal[];
  }) => {
    setUser((prev) => ({
      ...prev,
      ...data.user,
      onboardingCompleted: true,
    }));
    setIncomes(data.incomes);
    setFixedCosts(data.fixedCosts);
    setSavingsGoals(data.savingsGoals);
    setIsOnboardingOpen(false);
  };

  const handleUpgradeSuccess = (codeUsed?: string) => {
    setUser((prev) => ({
      ...prev,
      isPremium: true,
      referralCodeUsed: codeUsed || prev.referralCodeUsed,
    }));
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 select-none ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Mobile Top Header */}
      <Header
        user={user}
        theme={theme}
        notificationCount={totalAlertsCount}
        hasBudgetAlert={Boolean(thresholdNotification)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onToggleTheme={handleToggleTheme}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onRestartOnboarding={() => setIsOnboardingOpen(true)}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full max-w-md mx-auto">
        {/* In-App Budget Threshold Alert (Triggers when weekly spend >= threshold %, e.g., 80%) */}
        {thresholdNotification && !isAlertDismissed && (
          <BudgetThresholdAlert
            notification={thresholdNotification}
            onDismiss={() => setIsAlertDismissed(true)}
            onAskCoach={handleOpenCoachWithPrompt}
            onNavigateToSummary={() => setActiveTab('summary')}
            theme={theme}
          />
        )}

        {/* 1. DASHBOARD VIEW (With Savings Goal Progress Bars & Recharts Pie Chart) */}
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            user={user}
            incomes={incomes}
            fixedCosts={fixedCosts}
            savingsGoals={savingsGoals}
            expenses={expenses}
            theme={theme}
            onQuickLog={() => setIsQuickExpenseOpen(true)}
            onOpenCoachWithPrompt={handleOpenCoachWithPrompt}
            onDeleteExpense={handleDeleteExpense}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onToggleFixedCostPaid={handleToggleFixedCostPaid}
            onUpdateSavingsGoal={handleUpdateSavingsGoal}
            onAddSavingsGoal={handleAddSavingsGoal}
          />
        )}

        {/* 2. TASK MANAGER & TIMETABLE PAGE + DAILY BUDGET TRACKER */}
        {activeTab === 'tasks' && (
          <TaskManagerView
            tasks={tasks}
            timetableEvents={timetableEvents}
            expenses={expenses}
            metrics={metrics}
            user={user}
            theme={theme}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onAddTimetableEvent={handleAddTimetableEvent}
            onDeleteTimetableEvent={handleDeleteTimetableEvent}
            onAddExpense={handleAddExpense}
          />
        )}

        {/* 3. STUDY PAGE (GOOGLE NOTEBOOKLM CLONE WITH RAG & SOURCES SIDEBAR) */}
        {activeTab === 'study' && (
          <StudyNotebookLMView
            materials={studyMaterials}
            chatMessages={studyChatMessages}
            user={user}
            theme={theme}
            onAddMaterial={handleAddStudyMaterial}
            onToggleMaterialSelected={handleToggleStudyMaterial}
            onDeleteMaterial={handleDeleteStudyMaterial}
            onSendMessage={handleSendStudyMessage}
            onClearChat={() => setStudyChatMessages([])}
          />
        )}

        {/* 4. WEEKLY SUMMARY & TRENDS (WITH RECHARTS LINE CHART) */}
        {activeTab === 'summary' && (
          <WeeklySummaryView
            summary={weeklySummary}
            challenge={challenge}
            metrics={metrics}
            onToggleChallengeCompleted={() =>
              setChallenge((prev) => ({ ...prev, completed: !prev.completed }))
            }
            onAskCoachForAudit={(leak) =>
              handleOpenCoachWithPrompt(
                `My weekly digest shows ${leak} is my biggest money leak. Give me 3 student-tested hacks to cut this down while living in ${user.livingType}!`
              )
            }
            theme={theme}
          />
        )}

        {/* 5. AI MONEY COACH CHAT */}
        {activeTab === 'coach' && (
          <CoachChatView
            messages={coachMessages}
            onSendMessage={handleSendCoachMessage}
            metrics={metrics}
            user={user}
            expenses={expenses}
            theme={theme}
            initialPrompt={initialCoachPrompt}
          />
        )}

        {/* 6. STUDENT ESSENTIAL TOOLS */}
        {activeTab === 'tools' && (
          <StudentToolsView
            theme={theme}
            userName={user.name}
          />
        )}
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onOpenQuickLog={() => setIsQuickExpenseOpen(true)}
        theme={theme}
      />

      {/* 3-Tap Quick Expense Logger & CSV Statement Importer */}
      <QuickExpenseModal
        isOpen={isQuickExpenseOpen}
        onClose={() => setIsQuickExpenseOpen(false)}
        onAddExpense={handleAddExpense}
        onBatchAddExpenses={handleBatchAddExpenses}
        theme={theme}
      />

      {/* Rapid Under-2-Minute Onboarding Flow */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
        initialUser={user}
        theme={theme}
      />

      {/* POPIA Privacy, Data Export & Deletion Modal */}
      <PrivacySettingsModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        user={user}
        incomes={incomes}
        fixedCosts={fixedCosts}
        savingsGoals={savingsGoals}
        expenses={expenses}
        onWipeAllData={handleWipeAllData}
        onToggleConsent={(granted) =>
          setUser((prev) => ({ ...prev, popiaConsentGiven: granted }))
        }
        theme={theme}
      />

      {/* R39/mo Pro Upgrade & Student Society Referral Codes */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        user={user}
        onUpgradeSuccess={handleUpgradeSuccess}
        theme={theme}
      />

      {/* Notifications Hub & Budget Threshold Manager */}
      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        thresholdNotification={thresholdNotification}
        subscriptionAlerts={subscriptionAlerts}
        thresholdPercent={thresholdPercent}
        onChangeThresholdPercent={(pct) => {
          setThresholdPercent(pct);
          localStorage.setItem('yurlyfe_threshold_percent', String(pct));
          setIsAlertDismissed(false);
        }}
        onAskCoach={handleOpenCoachWithPrompt}
        onAddTestExpense={(amount, note) =>
          handleAddExpense({
            amount,
            category: 'food',
            note,
            source: 'manual',
          })
        }
        onResetDismissedAlert={() => setIsAlertDismissed(false)}
        isAlertDismissed={isAlertDismissed}
        theme={theme}
      />
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  TaskItem, 
  TimetableEvent, 
  DayOfWeek, 
  ExpenseItem, 
  ExpenseCategory, 
  SafeToSpendMetrics,
  UserProfile 
} from '../types';
import { formatZar, CATEGORY_META } from '../utils/calculations';
import { 
  Calendar, 
  CheckSquare, 
  Plus, 
  Clock, 
  MapPin, 
  Check, 
  Sparkles, 
  Wallet, 
  Trash2, 
  AlertCircle, 
  BookOpen, 
  Coffee, 
  Dumbbell, 
  Briefcase, 
  Bell, 
  ChevronRight,
  TrendingDown,
  Layers
} from 'lucide-react';

interface TaskManagerViewProps {
  tasks: TaskItem[];
  timetableEvents: TimetableEvent[];
  expenses: ExpenseItem[];
  metrics: SafeToSpendMetrics;
  user: UserProfile;
  theme: 'dark' | 'light';
  onToggleTask: (taskId: string) => void;
  onAddTask: (task: Omit<TaskItem, 'id'>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddTimetableEvent: (event: Omit<TimetableEvent, 'id'>) => void;
  onDeleteTimetableEvent: (eventId: string) => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'date'>) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TaskManagerView: React.FC<TaskManagerViewProps> = ({
  tasks,
  timetableEvents,
  expenses,
  metrics,
  user,
  theme,
  onToggleTask,
  onAddTask,
  onDeleteTask,
  onAddTimetableEvent,
  onDeleteTimetableEvent,
  onAddExpense,
}) => {
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'schedule' | 'tasks' | 'daily_budget'>('schedule');

  // Timetable State
  const todayDayName = DAYS[(new Date().getDay() + 6) % 7]; // Convert Sun(0) to 6
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayName);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventCourse, setEventCourse] = useState('');
  const [eventType, setEventType] = useState<'lecture' | 'tutorial' | 'lab' | 'study' | 'life' | 'exam'>('lecture');
  const [eventDay, setEventDay] = useState<DayOfWeek>(todayDayName);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:45');
  const [location, setLocation] = useState('Leslie Social LT1');

  // Task Filter State
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<'academic' | 'errand' | 'finance' | 'personal'>('academic');
  const [newTaskTime, setNewTaskTime] = useState('17:00');

  // Daily Budget Form State
  const [budgetAmount, setBudgetAmount] = useState<string>('');
  const [budgetCategory, setBudgetCategory] = useState<ExpenseCategory>('food');
  const [budgetNote, setBudgetNote] = useState<string>('');

  // Daily Budget calculations for Today
  const todayDateStr = new Date().toISOString().split('T')[0];
  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(todayDateStr));
  }, [expenses, todayDateStr]);

  const todaySpentTotal = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  const dailyLimit = Math.max(20, Math.round(metrics.dailySafeToSpend));
  const remainingDailyBalance = dailyLimit - todaySpentTotal;
  const isOverBudget = remainingDailyBalance < 0;
  const percentSpent = Math.min(100, Math.round((todaySpentTotal / dailyLimit) * 100));

  // Events filtered by day
  const filteredEvents = useMemo(() => {
    return timetableEvents
      .filter((ev) => ev.dayOfWeek === selectedDay)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [timetableEvents, selectedDay]);

  // Tasks filtered
  const filteredTasks = useMemo(() => {
    if (taskFilter === 'pending') return tasks.filter((t) => !t.completed);
    if (taskFilter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, taskFilter]);

  const completedCount = tasks.filter((t) => t.completed).length;

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim()) return;

    const colors: Record<string, string> = {
      lecture: '#10b981',
      tutorial: '#f59e0b',
      lab: '#3b82f6',
      study: '#6366f1',
      life: '#8b5cf6',
      exam: '#ef4444',
    };

    onAddTimetableEvent({
      title: eventTitle.trim(),
      courseCode: eventCourse.trim() || undefined,
      type: eventType,
      dayOfWeek: eventDay,
      startTime,
      endTime,
      location: location.trim() || 'Campus',
      color: colors[eventType] || '#10b981',
      reminder: true,
    });

    setEventTitle('');
    setEventCourse('');
    setIsAddEventModalOpen(false);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    onAddTask({
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: todayDateStr,
      dueTime: newTaskTime || undefined,
      estimatedMinutes: 30,
    });

    setNewTaskTitle('');
  };

  const handleAddDailyExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(budgetAmount);
    if (isNaN(amt) || amt <= 0) return;

    onAddExpense({
      amount: amt,
      category: budgetCategory,
      note: budgetNote.trim() || undefined,
      source: 'manual',
    });

    setBudgetAmount('');
    setBudgetNote('');
  };

  return (
    <div className="space-y-4 pb-20 max-w-md mx-auto px-4 pt-3 select-none">
      {/* Top Header Card */}
      <div
        className={`p-4 rounded-3xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-slate-900 to-slate-900/90 border-slate-800 text-white'
            : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <h2 className="font-black text-lg leading-tight">Student Schedule & Budget</h2>
              <p className="text-[11px] text-slate-400">Timetable, everyday life, and daily spending in one place</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {todayDayName}
          </span>
        </div>

        {/* 3-Section Segmented Tab Switcher */}
        <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 text-xs font-bold mt-3">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'schedule'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Timetable</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Daily Tasks ({tasks.filter(t => !t.completed).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('daily_budget')}
            className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'daily_budget'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Daily Budget</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 1. TIMETABLE & EVERYDAY LIFE CALENDAR INTERFACE */}
      {/* ============================================================== */}
      {activeTab === 'schedule' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Day of Week Selector Bar */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-1">
            {DAYS.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = todayDayName === day;
              const shortDay = day.slice(0, 3);
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-2 px-1 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                      : isDark
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <span className="text-[10px] uppercase font-bold block">{shortDay}</span>
                  {isToday && (
                    <span className={`w-1.5 h-1.5 rounded-full mx-auto mt-0.5 ${isSelected ? 'bg-white' : 'bg-emerald-500'}`} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Timetable Events Container */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  {selectedDay}'s Classes & Life Events
                </h3>
                <span className="text-[10px] text-slate-500">{filteredEvents.length} scheduled</span>
              </div>

              <button
                onClick={() => {
                  setEventDay(selectedDay);
                  setIsAddEventModalOpen(true);
                }}
                className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Class / Event</span>
              </button>
            </div>

            {filteredEvents.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                <Coffee className="w-8 h-8 mx-auto text-slate-500 mb-2 opacity-50" />
                <p className="font-semibold text-slate-700 dark:text-slate-300">No classes or events scheduled for {selectedDay}</p>
                <p className="text-[11px] text-slate-400 mt-1">Enjoy the open time or tap "+ Add Class / Event" to plan a study block or gym session.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredEvents.map((ev) => {
                  return (
                    <div
                      key={ev.id}
                      className={`p-3 rounded-2xl border transition-all flex items-start justify-between group ${
                        isDark ? 'bg-slate-800/40 border-slate-750 hover:bg-slate-800' : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100'
                      }`}
                      style={{ borderLeftWidth: '4px', borderLeftColor: ev.color }}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2 mb-0.5">
                          {ev.courseCode && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-mono text-slate-800 dark:text-slate-200">
                              {ev.courseCode}
                            </span>
                          )}
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            {ev.type}
                          </span>
                        </div>

                        <h4 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
                          {ev.title}
                        </h4>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <strong className="font-mono">{ev.startTime} - {ev.endTime}</strong>
                          </span>
                          <span className="flex items-center gap-1 truncate max-w-[170px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{ev.location}</span>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTimetableEvent(ev.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500"
                        title="Remove event"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. TO-DO LIST OF DAILY TASKS WITH CHECKBOXES */}
      {/* ============================================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Quick Add Task Input Card */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2">
              Quick Add Daily Task
            </h3>
            <form onSubmit={handleCreateTask} className="space-y-2.5">
              <input
                type="text"
                required
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g. Finish Python tutorial, buy groceries, study group..."
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Priority</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value as any)}
                    className={`w-full p-2 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Category</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className={`w-full p-2 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="academic">📚 Academic</option>
                    <option value="finance">💰 Finance</option>
                    <option value="errand">🧺 Errand</option>
                    <option value="personal">🧘 Personal</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-0.5">Due Time</label>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className={`w-full p-2 rounded-xl text-xs border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add To Daily To-Do List</span>
              </button>
            </form>
          </div>

          {/* Task List Header with Filter Chips */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Daily Checklist ({completedCount}/{tasks.length} Done)
                </h4>
              </div>

              {/* Filter Switcher */}
              <div className="flex rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-2 py-0.5 rounded-lg ${taskFilter === 'all' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-xs' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-2 py-0.5 rounded-lg ${taskFilter === 'pending' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-xs' : 'text-slate-400'}`}
                >
                  To-Do
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-2 py-0.5 rounded-lg ${taskFilter === 'completed' ? 'bg-white dark:bg-slate-700 text-emerald-500 shadow-xs' : 'text-slate-400'}`}
                >
                  Done
                </button>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                <CheckSquare className="w-8 h-8 mx-auto text-emerald-500/40 mb-2" />
                <p>No tasks in this view.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTasks.map((task) => {
                  const priorityColors = {
                    high: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
                    medium: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
                    low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
                  };

                  return (
                    <div
                      key={task.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between transition-all group ${
                        task.completed
                          ? 'opacity-60 bg-slate-100/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800'
                          : isDark
                          ? 'bg-slate-800/40 border-slate-750 hover:bg-slate-800'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        {/* Interactive Checkbox */}
                        <button
                          onClick={() => onToggleTask(task.id)}
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                              : 'border-slate-400 hover:border-emerald-500 dark:border-slate-600'
                          }`}
                        >
                          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          <p
                            className={`text-xs font-semibold leading-tight truncate ${
                              task.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </p>

                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${priorityColors[task.priority]}`}
                            >
                              {task.priority}
                            </span>

                            {task.courseCode && (
                              <span className="text-[10px] font-mono font-semibold text-slate-400">
                                {task.courseCode}
                              </span>
                            )}

                            {task.dueTime && (
                              <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {task.dueTime}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-rose-500 shrink-0"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DAILY BUDGET TRACKER SECTION (REQUIREMENT 2) */}
      {/* ============================================================== */}
      {activeTab === 'daily_budget' && (
        <div className="space-y-3.5 animate-in fade-in duration-150">
          {/* Daily Budget Summary Card */}
          <div
            className={`p-5 rounded-3xl border transition-all ${
              isDark
                ? 'bg-gradient-to-br from-slate-900 to-slate-900/90 border-slate-800 text-white'
                : 'bg-gradient-to-br from-white to-emerald-50/50 border-emerald-100 text-slate-900 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Today's Daily Budget Tracker
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {new Date().toLocaleDateString('en-ZA', { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Daily Big Numbers */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <span className="text-[10px] text-slate-400 block">Daily Spending Limit</span>
                <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                  {formatZar(dailyLimit, false)}
                </span>
                <span className="text-[10px] text-slate-500 block">Safe spend calculated</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 block">Remaining Today</span>
                <span
                  className={`text-2xl font-black font-mono ${
                    isOverBudget ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatZar(remainingDailyBalance, false)}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {isOverBudget ? 'Over limit for today' : 'Available until midnight'}
                </span>
              </div>
            </div>

            {/* Today's Spent Progress Meter */}
            <div className="space-y-1.5 mb-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600 dark:text-slate-400">
                  Spent Today: <strong className="font-mono text-slate-900 dark:text-white">{formatZar(todaySpentTotal)}</strong>
                </span>
                <span className={isOverBudget ? 'text-rose-500 font-bold' : 'text-emerald-600 dark:text-emerald-400'}>
                  {percentSpent}% of daily limit
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverBudget
                      ? 'bg-rose-500'
                      : percentSpent > 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${percentSpent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Expense Logging Box */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Log Today's Expense Directly</span>
              <span className="text-[10px] text-emerald-500 font-mono">Deducts from daily limit</span>
            </h4>

            <form onSubmit={handleAddDailyExpense} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">
                    R
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    required
                    value={budgetAmount}
                    onChange={(e) => setBudgetAmount(e.target.value)}
                    placeholder="Amount (R)"
                    className={`w-full pl-7 pr-3 py-2 rounded-xl text-xs font-mono font-bold border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value as any)}
                  className={`w-full px-3 py-2 rounded-xl text-xs border font-semibold ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="food">🍔 Food & Meals</option>
                  <option value="transport">🚐 Transport / Taxi</option>
                  <option value="data">📶 Data & Airtime</option>
                  <option value="books">📚 Books & Notes</option>
                  <option value="social">🎉 Social & Vibes</option>
                  <option value="other">🏷️ Other</option>
                </select>
              </div>

              <input
                type="text"
                value={budgetNote}
                onChange={(e) => setBudgetNote(e.target.value)}
                placeholder="What was this for? (e.g. tuckshop pie, taxi fare)"
                className={`w-full px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-98 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log to Daily Budget</span>
              </button>
            </form>
          </div>

          {/* Today's Logged Transactions */}
          <div
            className={`p-4 rounded-3xl border transition-all ${
              isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-2.5">
              Today's Expenses ({todayExpenses.length})
            </h4>

            {todayExpenses.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No expenses logged yet today! Keep it up to stay under limit.</p>
            ) : (
              <div className="space-y-2">
                {todayExpenses.map((exp) => {
                  const meta = CATEGORY_META[exp.category] || CATEGORY_META.other;
                  return (
                    <div
                      key={exp.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-slate-800/40 border-slate-750' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="text-base">{meta.icon}</span>
                        <div className="truncate">
                          <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{exp.note || meta.label}</p>
                          <p className="text-[10px] text-slate-400">{meta.label}</p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 dark:text-white shrink-0">
                        -{formatZar(exp.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD TIMETABLE / LIFE EVENT */}
      {/* ============================================================== */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-4 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Add Class or Life Event</h3>
              <button
                onClick={() => setIsAddEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Title / Event Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Calculus Lecture, Gym, Tutoring Shift"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Course Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. ECO1010"
                    value={eventCourse}
                    onChange={(e) => setEventCourse(e.target.value)}
                    className={`w-full p-2 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Event Type</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className={`w-full p-2 rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="lecture">📖 Lecture</option>
                    <option value="tutorial">✏️ Tutorial</option>
                    <option value="lab">💻 Lab</option>
                    <option value="study">📚 Study Block</option>
                    <option value="life">🏋️ Life / Gym / Work</option>
                    <option value="exam">⚠️ Exam / Test</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Day of the Week</label>
                <select
                  value={eventDay}
                  onChange={(e) => setEventDay(e.target.value as any)}
                  className={`w-full p-2 rounded-xl border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Start Time</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={`w-full p-2 rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">End Time</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={`w-full p-2 rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Location / Lecture Hall</label>
                <input
                  type="text"
                  placeholder="e.g. Leslie Social LT1, Online, Main Library"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full p-2 rounded-xl border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddEventModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Save to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

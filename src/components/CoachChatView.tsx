/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  SafeToSpendMetrics, 
  UserProfile, 
  IncomeSource, 
  ExpenseItem 
} from '../types';
import { formatZar } from '../utils/calculations';
import { Send, Sparkles, AlertCircle, Bot, User as UserIcon, RefreshCw } from 'lucide-react';

interface CoachChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  metrics: SafeToSpendMetrics;
  user: UserProfile;
  expenses: ExpenseItem[];
  theme: 'dark' | 'light';
  initialPrompt?: string;
}

const SAMPLE_PROMPTS = [
  "Can I afford dinner out tonight?",
  "Where did my money leak this week?",
  "How do I make my NSFAS last until payday?",
  "Cheapest way to buy student data?",
  "How much can I spend on groceries this weekend?"
];

export const CoachChatView: React.FC<CoachChatViewProps> = ({
  messages,
  onSendMessage,
  metrics,
  user,
  expenses,
  theme,
  initialPrompt,
}) => {
  const [input, setInput] = useState(initialPrompt || '');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    setInput('');
    setIsLoading(true);
    try {
      await onSendMessage(query);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-md mx-auto px-4 pt-2 pb-20">
      {/* Financial Context Pill Bar */}
      <div
        className={`p-2.5 rounded-2xl border text-xs mb-3 flex items-center justify-between shrink-0 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-100 text-slate-700 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-semibold">
            Safe: <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatZar(metrics.dailySafeToSpend, false)}/day</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          Bank: <strong className="font-mono text-slate-900 dark:text-white">{formatZar(user.currentBalance)}</strong>
        </span>
        <span className="text-[11px] text-slate-400">
          {metrics.daysUntilNextPayday}d to {metrics.nextPaydaySource.split(' ')[0]}
        </span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-slate-700 text-white'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-sm'
                }`}
              >
                {isUser ? <UserIcon className="w-4 h-4" /> : '🤖'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[82%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-emerald-600 text-white rounded-tr-sm'
                    : isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    : 'bg-white border border-slate-100 text-slate-800 rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    isUser ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-xs shrink-0">
              🤖
            </div>
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                isDark ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-white border border-slate-100 text-slate-500'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-500" />
              <span>Checking your student numbers & budget pacing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Suggestion Chips */}
      <div className="py-2 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
        {SAMPLE_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className={`text-[11px] font-medium px-2.5 py-1.5 rounded-full whitespace-nowrap border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-emerald-500/50'
                : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-500 shadow-xs'
            }`}
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field & Submit */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 shrink-0 pt-1"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask coach (e.g. Can I afford R120 night out?)"
          className={`flex-1 px-4 py-3 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
          }`}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Regulatory POPIA / FAIS Disclaimer */}
      <p className="text-[10px] text-slate-400 text-center mt-2 shrink-0">
        MoneyMate provides educational student budgeting guidance only, not regulated financial advice.
      </p>
    </div>
  );
};

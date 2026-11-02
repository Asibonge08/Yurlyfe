/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  StudyMaterial, 
  StudyChatMessage, 
  RAGCitation, 
  UserProfile 
} from '../types';
import { 
  BookOpen, 
  Plus, 
  Upload, 
  FileText, 
  Check, 
  Sparkles, 
  Send, 
  Layers, 
  Search, 
  Trash2, 
  CheckSquare, 
  HelpCircle, 
  FileCheck, 
  Mic, 
  RefreshCw, 
  ExternalLink,
  ChevronRight,
  Flame,
  Info
} from 'lucide-react';

interface StudyNotebookLMViewProps {
  materials: StudyMaterial[];
  chatMessages: StudyChatMessage[];
  user: UserProfile;
  theme: 'dark' | 'light';
  onAddMaterial: (mat: Omit<StudyMaterial, 'id' | 'dateAdded'>) => void;
  onToggleMaterialSelected: (id: string) => void;
  onDeleteMaterial: (id: string) => void;
  onSendMessage: (text: string, action?: 'study_guide' | 'quiz' | 'flashcards') => Promise<void>;
  onClearChat: () => void;
}

export const StudyNotebookLMView: React.FC<StudyNotebookLMViewProps> = ({
  materials,
  chatMessages,
  user,
  theme,
  onAddMaterial,
  onToggleMaterialSelected,
  onDeleteMaterial,
  onSendMessage,
  onClearChat,
}) => {
  const isDark = theme === 'dark';
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [selectedPreviewSource, setSelectedPreviewSource] = useState<StudyMaterial | null>(null);

  // New Source Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCourse, setNewCourse] = useState('ECO1010');
  const [newType, setNewType] = useState<'pdf' | 'notes' | 'slides' | 'syllabus'>('notes');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  // Mobile sidebar toggle
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isLoading]);

  const activeSources = materials.filter((m) => m.selected);
  const totalWordCount = activeSources.reduce((sum, m) => sum + m.wordCount, 0);

  const handleSend = async (customText?: string, action?: 'study_guide' | 'quiz' | 'flashcards') => {
    const text = customText || inputMessage;
    if ((!text.trim() && !action) || isLoading) return;

    setInputMessage('');
    setIsLoading(true);
    try {
      await onSendMessage(text, action);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const words = newContent.trim().split(/\s+/).length;

    onAddMaterial({
      title: newTitle.trim(),
      courseCode: newCourse.trim() || 'General',
      type: newType,
      content: newContent.trim(),
      selected: true,
      wordCount: words,
      authorOrSpeaker: newAuthor.trim() || undefined,
    });

    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
    setIsAddSourceModalOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] max-w-md mx-auto px-4 pt-2 pb-20 select-none">
      {/* Google NotebookLM Top Brand & RAG Status Banner */}
      <div
        className={`p-3.5 rounded-3xl border mb-3 flex items-center justify-between transition-all ${
          isDark
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border-slate-800 text-white'
            : 'bg-gradient-to-r from-white via-indigo-50/50 to-white border-emerald-100 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center font-black text-sm shadow-md">
            📓
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                yurlyfe Study Studio
              </h3>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-500/15 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                RAG Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded in <strong className="text-emerald-500">{activeSources.length} sources</strong> ({totalWordCount.toLocaleString()} words)
            </p>
          </div>
        </div>

        {/* Toggle Sources Sidebar Drawer */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
            isSidebarOpen
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : isDark
              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-500'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Sources ({activeSources.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* NOTEBOOKLM SOURCES SIDEBAR / DRAWER */}
      {/* ============================================================== */}
      {isSidebarOpen && (
        <div
          className={`p-4 rounded-3xl border mb-3 space-y-3 animate-in fade-in duration-200 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-md'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-500" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                Uploaded Study Materials ({materials.length})
              </h4>
            </div>

            <button
              onClick={() => setIsAddSourceModalOpen(true)}
              className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3 h-3" />
              <span>Add Source</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            Check the sources you want the AI to ground its answers and quizzes on:
          </p>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {materials.map((mat) => {
              const icons = {
                pdf: '📄',
                notes: '📝',
                slides: '📊',
                syllabus: '📋',
                url: '🌐',
              };

              return (
                <div
                  key={mat.id}
                  className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition-colors ${
                    mat.selected
                      ? isDark
                        ? 'bg-indigo-950/20 border-indigo-800/60 text-slate-200'
                        : 'bg-indigo-50/60 border-indigo-200 text-slate-900'
                      : 'opacity-50 bg-slate-100/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <button
                      onClick={() => onToggleMaterialSelected(mat.id)}
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        mat.selected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-400'
                      }`}
                      title={mat.selected ? 'Source is active for RAG' : 'Source is disabled'}
                    >
                      {mat.selected && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>

                    <span className="text-base shrink-0">{icons[mat.type]}</span>

                    <div className="min-w-0">
                      <button
                        onClick={() => setSelectedPreviewSource(mat)}
                        className="font-bold text-left hover:underline truncate block max-w-[200px]"
                      >
                        {mat.title}
                      </button>
                      <span className="text-[10px] text-slate-400">
                        {mat.courseCode} • {mat.wordCount} words
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setSelectedPreviewSource(mat)}
                      className="text-[10px] text-indigo-400 hover:underline px-1"
                    >
                      View
                    </button>
                    <button
                      onClick={() => onDeleteMaterial(mat.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="Remove source"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* NOTEBOOKLM QUICK STUDIO ACTION CHIPS */}
      {/* ============================================================== */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 shrink-0 mb-2">
        <button
          onClick={() => handleSend('', 'study_guide')}
          disabled={isLoading || activeSources.length === 0}
          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600/15 to-teal-600/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Study Guide</span>
        </button>

        <button
          onClick={() => handleSend('', 'quiz')}
          disabled={isLoading || activeSources.length === 0}
          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600/15 to-purple-600/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all disabled:opacity-40"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Quiz Me (Recall)</span>
        </button>

        <button
          onClick={() => handleSend('', 'flashcards')}
          disabled={isLoading || activeSources.length === 0}
          className="py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600/15 to-orange-600/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 whitespace-nowrap active:scale-95 transition-all disabled:opacity-40"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Create Flashcards</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* MAIN RAG CHAT INTERFACE */}
      {/* ============================================================== */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
        {chatMessages.map((msg) => {
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
                    : 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-sm'
                }`}
              >
                {isUser ? '👤' : '📓'}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-sm'
                    : isDark
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-sm'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.text}

                {/* Grounding Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      Cited Sources (RAG Grounding):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cite, i) => (
                        <div
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-400 flex items-center gap-1"
                        >
                          <span>📌 {cite.sourceTitle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div
                  className={`text-[9px] mt-1.5 text-right ${
                    isUser ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 text-white flex items-center justify-center text-xs shrink-0">
              📓
            </div>
            <div
              className={`p-3 rounded-2xl text-xs flex items-center gap-2 ${
                isDark ? 'bg-slate-900 border border-slate-800 text-slate-400' : 'bg-white border border-slate-200 text-slate-600'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-500" />
              <span>Scanning your uploaded source documents & synthesizing answer...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-1.5 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
        {[
          "Explain the Keynesian multiplier formula",
          "What is binary search tree worst-case time?",
          "Summarize POPIA section 24 rights",
          "What are common exam traps for this topic?",
        ].map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className={`text-[10px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap border transition-all active:scale-95 ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-500 shadow-xs'
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
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={
            activeSources.length === 0
              ? 'Select at least 1 source to chat...'
              : 'Ask anything based on your uploaded sources...'
          }
          disabled={activeSources.length === 0}
          className={`flex-1 px-4 py-3 rounded-2xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 shadow-sm'
          }`}
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || isLoading || activeSources.length === 0}
          className="p-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* ============================================================== */}
      {/* MODAL: ADD STUDY SOURCE MATERIAL */}
      {/* ============================================================== */}
      {isAddSourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-sm rounded-3xl p-5 shadow-2xl border space-y-3.5 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Upload Study Source Material</h3>
              <button
                onClick={() => setIsAddSourceModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSource} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Source Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 4 Lecture Notes, Past Exam 2025"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. ECO1010"
                    value={newCourse}
                    onChange={(e) => setNewCourse(e.target.value)}
                    className={`w-full p-2 rounded-xl border font-mono ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Source Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className={`w-full p-2 rounded-xl border ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <option value="notes">📝 Lecture Notes</option>
                    <option value="slides">📊 Slide Deck</option>
                    <option value="pdf">📄 PDF / Reader</option>
                    <option value="syllabus">📋 Course Syllabus</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Author / Lecturer</label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Daniels, Textbook Chapter 2"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className={`w-full p-2 rounded-xl border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Content / Document Text *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Paste lecture text, slides bullet points, or document excerpt for the AI to ground in..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border font-mono text-[11px] focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddSourceModalOpen(false)}
                  className="flex-1 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-400 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                >
                  Add to NotebookLM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: PREVIEW SOURCE DOCUMENT */}
      {/* ============================================================== */}
      {selectedPreviewSource && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className={`w-full max-w-md rounded-3xl p-5 shadow-2xl border flex flex-col max-h-[80vh] ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
              <div>
                <h3 className="font-bold text-sm leading-tight">{selectedPreviewSource.title}</h3>
                <span className="text-[10px] text-slate-400">
                  {selectedPreviewSource.courseCode} • {selectedPreviewSource.wordCount} words • {selectedPreviewSource.authorOrSpeaker}
                </span>
              </div>
              <button
                onClick={() => setSelectedPreviewSource(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto text-xs whitespace-pre-wrap leading-relaxed font-mono p-2 rounded-xl bg-slate-100 dark:bg-slate-800/50">
              {selectedPreviewSource.content}
            </div>

            <button
              onClick={() => setSelectedPreviewSource(null)}
              className="w-full mt-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
            >
              Close Document
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

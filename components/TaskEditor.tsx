'use client';

import React, { useState } from 'react';
import { Priority } from '@/lib/types';
import {
  Flag,
  Calendar as CalendarIcon,
  Clock,
  ChevronDown,
  X,
  Waves,
  Inbox as InboxIcon,
  Lightbulb,
} from 'lucide-react';
import clsx from 'clsx';
import { DatePickerPopover } from './DatePickerPopover';
import { parseNaturalLanguageTask } from '@/lib/services/naturalLanguage';
import { format } from 'date-fns';

interface TaskEditorProps {
  projectId: string;
  sectionId?: string | null;
  parentId?: string | null;
  onSave: (taskData: {
    content: string;
    description: string;
    priority: Priority;
    dueDate?: string | null;
    dueTime?: string | null;
    deadline?: string | null;
    recurrence?: string | null;
  }) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
}

export function TaskEditor({
  projectId,
  sectionId,
  parentId,
  onSave,
  onCancel,
  placeholder = 'Task name',
}: TaskEditorProps) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueDate, setDueDate] = useState<string | null>(format(new Date(), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string>('');
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [showNaturalLanguageTip, setShowNaturalLanguageTip] = useState(false);
  const [isRecordingWave, setIsRecordingWave] = useState(false);
  const [loading, setLoading] = useState(false);

  // Natural language parsing as user types or pastes
  const handleContentChange = (val: string) => {
    setContent(val);
    // If typing date/priority keywords, suggest or auto-parse
    if (/\b(?:p[1-4]|tomorrow|today|every|next week|at \d)\b/i.test(val)) {
      setShowNaturalLanguageTip(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    try {
      setLoading(true);

      // Run natural language parser on content
      const parsed = parseNaturalLanguageTask(content.trim());
      const finalContent = parsed.cleanContent || content.trim();
      const finalPriority = parsed.priority || priority;
      const finalDueDate = parsed.dueDate || dueDate;
      const finalDueTime = parsed.dueTime || dueTime;
      const finalRecurrence = parsed.recurrence || recurrence;

      await onSave({
        content: finalContent,
        description: description.trim(),
        priority: finalPriority,
        dueDate: finalDueDate,
        dueTime: finalDueTime,
        deadline: deadline || null,
        recurrence: finalRecurrence,
      });

      setContent('');
      setDescription('');
      setShowNaturalLanguageTip(false);
    } finally {
      setLoading(false);
    }
  };

  const priorityMeta: Record<Priority, { label: string; color: string }> = {
    1: { label: 'Priority 1', color: 'text-[#d1453b]' },
    2: { label: 'Priority 2', color: 'text-[#eb8909]' },
    3: { label: 'Priority 3', color: 'text-[#246fe0]' },
    4: { label: 'Priority 4', color: 'text-gray-400' },
  };

  const displayDueDate = dueDate
    ? dueDate === format(new Date(), 'yyyy-MM-dd')
      ? 'Today'
      : format(new Date(dueDate), 'd MMM')
    : null;

  return (
    <div className="relative mb-3">
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-neutral-700 rounded-[10px] shadow-xs transition-all text-sm"
      >
        {/* Title & Ramble wave icon */}
        <div className="flex items-start justify-between gap-2">
          <input
            type="text"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholder}
            autoFocus
            className="w-full bg-transparent font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none mb-1 text-[14px]"
          />
          <button
            type="button"
            onClick={() => {
              setIsRecordingWave(!isRecordingWave);
              if (!isRecordingWave) {
                setContent('Review proposal notes tomorrow at 10am p1');
              }
            }}
            className={clsx(
              'p-1 rounded transition-colors cursor-pointer',
              isRecordingWave
                ? 'text-[#1F91EB] bg-[#1F91EB]/10 animate-pulse'
                : 'text-gray-400 hover:text-[#1F91EB]'
            )}
            title="Voice Ramble Input (Pro)"
          >
            <Waves className="w-4 h-4" />
          </button>
        </div>

        {/* Description Textarea */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          rows={2}
          className="w-full bg-transparent text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none text-[13px]"
        />

        {/* Interactive Pill Buttons Row (Exact Todoist UI) */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2">
          {/* Due Date Pill: [Today x] */}
          <div className="relative">
            {displayDueDate ? (
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#058527] bg-[#058527]/10 text-[#058527] rounded-md text-[12px] font-medium">
                <button
                  type="button"
                  onClick={() => setIsDateOpen(!isDateOpen)}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>{displayDueDate}</span>
                  {dueTime && <span className="text-[11px] font-mono">{dueTime}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDueDate(null);
                    setDueTime(null);
                  }}
                  className="hover:bg-[#058527]/20 rounded-full p-0.5 cursor-pointer ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsDateOpen(!isDateOpen)}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md text-[12px] font-medium cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5 text-gray-500" />
                <span>Due date</span>
              </button>
            )}

            {isDateOpen && (
              <DatePickerPopover
                initialDate={dueDate}
                initialTime={dueTime}
                initialRecurrence={recurrence}
                onSelect={(data) => {
                  setDueDate(data.dueDate);
                  if (data.dueTime) setDueTime(data.dueTime);
                  if (data.recurrence) setRecurrence(data.recurrence);
                  setIsDateOpen(false);
                }}
                onClose={() => setIsDateOpen(false)}
              />
            )}
          </div>

          {/* Deadline Pill */}
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md text-[12px] font-medium cursor-pointer">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-[11px]"
              title="Deadline"
            />
          </div>

          {/* Priority Flag Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsPriorityOpen(!isPriorityOpen)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-2 py-0.5 border rounded-md text-[12px] font-medium cursor-pointer',
                priority !== 4
                  ? 'border-gray-300 ' + priorityMeta[priority].color
                  : 'border-gray-300 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
              )}
            >
              <Flag className={clsx('w-3.5 h-3.5', priorityMeta[priority].color)} fill="currentColor" />
              <span>Priority</span>
            </button>

            {isPriorityOpen && (
              <div className="absolute left-0 top-full mt-1 z-30 p-1 bg-white dark:bg-[#282828] border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg w-36 space-y-0.5">
                {([1, 2, 3, 4] as Priority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPriority(p);
                      setIsPriorityOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-700 text-left text-xs font-medium cursor-pointer"
                  >
                    <Flag className={clsx('w-3.5 h-3.5', priorityMeta[p].color)} fill="currentColor" />
                    <span>{priorityMeta[p].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reminders Pill */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 border border-gray-300 dark:border-neutral-700 text-gray-500 rounded-md text-[12px] font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Reminders</span>
          </div>

          {/* More Actions Pill (...) */}
          <div className="inline-flex items-center px-1.5 py-0.5 border border-gray-300 dark:border-neutral-700 text-gray-400 rounded-md text-[12px] font-medium">
            <span>•••</span>
          </div>
        </div>

        {/* Footer Row: Project Selector (Left) & Cancel/Add task (Right) */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-[#f0f0f0] dark:border-neutral-800">
          {/* Project Selector pill */}
          <button
            type="button"
            className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-neutral-800 py-1 px-2 rounded-md transition-colors cursor-pointer"
          >
            <InboxIcon className="w-3.5 h-3.5 text-gray-400" />
            <span>Inbox</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim() || loading}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1F91EB] hover:bg-[#5BADEE] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-xs cursor-pointer"
            >
              {loading ? 'Adding...' : 'Add task'}
            </button>
          </div>
        </div>
      </form>

      {/* Natural Language Tooltip Popover (matching Mobbin media_4.webp) */}
      {showNaturalLanguageTip && (
        <div className="absolute left-1/3 top-full mt-2 w-72 bg-[#1f1f1f] text-white p-3.5 rounded-xl shadow-2xl z-40 text-xs space-y-2 border border-neutral-700 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-1.5 font-semibold text-white">
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Use natural language</span>
          </div>
          <p className="text-gray-300 text-[11px] leading-relaxed">
            Hacklist recognizes dates like <span className="text-white font-medium">every day</span>,{' '}
            <span className="text-white font-medium">next Wednesday</span>, priorities like{' '}
            <span className="text-white font-medium">p1</span>, and tags like{' '}
            <span className="text-white font-medium">#Work</span>!
          </p>
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowNaturalLanguageTip(false)}
              className="px-2.5 py-1 text-gray-300 hover:text-white text-[11px] rounded hover:bg-neutral-800"
            >
              Got it
            </button>
            <button
              type="button"
              onClick={() => setShowNaturalLanguageTip(false)}
              className="px-3 py-1 bg-[#1F91EB] text-white font-semibold text-[11px] rounded"
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

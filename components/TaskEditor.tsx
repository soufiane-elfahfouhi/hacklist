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
} from 'lucide-react';
import clsx from 'clsx';

interface TaskEditorProps {
  projectId: string;
  sectionId?: string | null;
  parentId?: string | null;
  onSave: (taskData: {
    content: string;
    description: string;
    priority: Priority;
    dueDate?: string | null;
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
  const [dueDate, setDueDate] = useState<string>('Today');
  const [deadline, setDeadline] = useState<string>('');
  const [recurrence, setRecurrence] = useState<string>('');
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || loading) return;

    try {
      setLoading(true);
      const computedDueDate =
        dueDate === 'Today'
          ? '2026-10-31'
          : dueDate === 'Tomorrow'
          ? '2026-11-01'
          : dueDate || null;

      await onSave({
        content: content.trim(),
        description: description.trim(),
        priority,
        dueDate: computedDueDate,
        deadline: deadline || null,
        recurrence: recurrence || null,
      });
      setContent('');
      setDescription('');
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

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white dark:bg-[#202020] border border-[#e5e5e5] dark:border-neutral-700 rounded-[10px] shadow-xs transition-all text-sm mb-3"
    >
      {/* Title & Ramble wave icon */}
      <div className="flex items-start justify-between gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          autoFocus
          className="w-full bg-transparent font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none mb-1 text-[14px]"
        />
        <button
          type="button"
          className="text-gray-400 hover:text-[#1F91EB] transition-colors p-1"
          title="Voice Ramble Input"
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
          {dueDate ? (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 border border-[#058527] bg-[#058527]/10 text-[#058527] rounded-md text-[12px] font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{dueDate}</span>
              <button
                type="button"
                onClick={() => setDueDate('')}
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
            <div className="absolute left-0 top-full mt-1 z-30 p-2 bg-white dark:bg-[#282828] border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg space-y-1 w-40 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDueDate('Today');
                  setIsDateOpen(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => {
                  setDueDate('Tomorrow');
                  setIsDateOpen(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => {
                  setDueDate('Next week');
                  setIsDateOpen(false);
                }}
                className="w-full text-left px-2 py-1 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded cursor-pointer"
              >
                Next week
              </button>
            </div>
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
  );
}

'use client';

import React, { useState } from 'react';
import { Priority } from '@/lib/types';
import {
  Flag,
  Calendar as CalendarIcon,
  Clock,
  Tag,
  ChevronDown,
  X,
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
  const [dueDate, setDueDate] = useState<string>('');
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
      await onSave({
        content: content.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
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
      className="p-3 bg-white dark:bg-[#202020] border border-gray-300 dark:border-neutral-700 rounded-xl shadow-xs transition-all text-sm mb-3"
    >
      {/* Title Input */}
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="w-full bg-transparent font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none mb-1 text-[14px]"
      />

      {/* Description Textarea */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full bg-transparent text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none text-[13px]"
      />

      {/* Pill Buttons Row: Due Date, Priority, Deadline */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {/* Due Date Pill Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDateOpen(!isDateOpen)}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[12px] font-medium transition-colors cursor-pointer',
              dueDate
                ? 'border-[#058527] text-[#058527] bg-[#058527]/10'
                : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{dueDate || 'Due date'}</span>
          </button>

          {isDateOpen && (
            <div className="absolute left-0 top-full mt-1 z-30 p-2 bg-white dark:bg-[#282828] border border-gray-200 dark:border-neutral-700 rounded-lg shadow-lg space-y-2">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  setIsDateOpen(false);
                }}
                className="text-xs bg-gray-50 dark:bg-neutral-800 p-1.5 border border-gray-200 dark:border-neutral-700 rounded-md focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Priority Flag Pill Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsPriorityOpen(!isPriorityOpen)}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1 border rounded-md text-[12px] font-medium transition-colors cursor-pointer',
              priority !== 4
                ? 'border-gray-300 ' + priorityMeta[priority].color
                : 'border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800'
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

        {/* Hard Deadline Input Pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 border border-gray-200 dark:border-neutral-700 rounded-md text-[12px] text-gray-600 dark:text-gray-300">
          <Clock className="w-3.5 h-3.5 text-rose-500" />
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Deadline"
            className="bg-transparent focus:outline-none cursor-pointer text-[11px]"
            title="Hard deadline"
          />
        </div>
      </div>

      {/* Bottom Row: Cancel and Add Task buttons */}
      <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-neutral-800">
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
    </form>
  );
}

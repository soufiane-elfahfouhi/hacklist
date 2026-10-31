'use client';

import React, { useState } from 'react';
import { Priority } from '@/lib/types';
import { Flag, Calendar, X, Plus } from 'lucide-react';
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
  placeholder = 'Task name...',
}: TaskEditorProps) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [dueDate, setDueDate] = useState<string>('');
  const [deadline, setDeadline] = useState<string>('');
  const [recurrence, setRecurrence] = useState<string>('');
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

  const priorityMeta: Record<Priority, { label: string; color: string; border: string }> = {
    1: { label: 'P1', color: 'text-[#d1453b]', border: 'border-[#d1453b]' },
    2: { label: 'P2', color: 'text-[#eb8909]', border: 'border-[#eb8909]' },
    3: { label: 'P3', color: 'text-[#246fe0]', border: 'border-[#246fe0]' },
    4: { label: 'P4', color: 'text-gray-400', border: 'border-gray-300' },
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-white dark:bg-[#242424] border border-gray-300 dark:border-neutral-700 rounded-xl shadow-sm focus-within:border-gray-400 transition-all text-sm mb-3"
    >
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        autoFocus
        className="w-full bg-transparent font-medium text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none mb-1 text-[14px]"
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={2}
        className="w-full bg-transparent text-gray-600 dark:text-gray-300 placeholder-gray-400 focus:outline-none resize-none text-[12px]"
      />

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Due date picker input */}
          <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md text-xs text-gray-700 dark:text-gray-300">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs"
            />
          </div>

          {/* Priority selector buttons */}
          <div className="flex items-center border border-gray-200 dark:border-neutral-700 rounded-md p-0.5 bg-gray-50 dark:bg-neutral-800">
            {([1, 2, 3, 4] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={clsx(
                  'px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer',
                  priority === p
                    ? 'bg-white dark:bg-neutral-700 shadow-xs ' + priorityMeta[p].color
                    : 'text-gray-400 hover:text-gray-600'
                )}
                title={`Priority ${p}`}
              >
                <Flag className="w-3 h-3 fill-current" />
                {priorityMeta[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!content.trim() || loading}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-[#1F91EB] hover:bg-[#5BADEE] disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all shadow-xs cursor-pointer"
          >
            {loading ? 'Adding...' : 'Add task'}
          </button>
        </div>
      </div>
    </form>
  );
}

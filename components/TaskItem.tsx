'use client';

import React from 'react';
import { Task, Priority } from '@/lib/types';
import {
  Check,
  Calendar,
  MessageSquare,
  ListTree,
  Clock,
  Hash,
} from 'lucide-react';
import clsx from 'clsx';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onClick: (task: Task) => void;
  projectName?: string;
  projectColor?: string;
  depth?: number;
}

export function TaskItem({
  task,
  onComplete,
  onClick,
  projectName,
  projectColor,
  depth = 0,
}: TaskItemProps) {
  const isCompleted = !!task.completed_at;

  const priorityColors: Record<Priority, { border: string; hoverBg: string; text: string }> = {
    1: { border: 'border-[#d1453b]', hoverBg: 'hover:bg-[#d1453b]/10', text: 'text-[#d1453b]' },
    2: { border: 'border-[#eb8909]', hoverBg: 'hover:bg-[#eb8909]/10', text: 'text-[#eb8909]' },
    3: { border: 'border-[#246fe0]', hoverBg: 'hover:bg-[#246fe0]/10', text: 'text-[#246fe0]' },
    4: { border: 'border-gray-400', hoverBg: 'hover:bg-gray-100', text: 'text-gray-400' },
  };

  const pColor = priorityColors[task.priority] || priorityColors[4];

  const todayStr = '2026-10-31';
  const dueDateStr = task.due_date || (task.due_at ? task.due_at.split('T')[0] : null);
  const isOverdue = dueDateStr && dueDateStr < todayStr && !isCompleted;

  return (
    <div
      style={{ marginLeft: `${depth * 24}px` }}
      className={clsx(
        'group flex items-start gap-3 py-2.5 px-1 border-b border-[#f0f0f0] dark:border-neutral-800/60 hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors cursor-pointer select-none',
        isCompleted && 'opacity-50'
      )}
      onClick={() => onClick(task)}
    >
      {/* Thin Circular Priority Checkbox (Exact Todoist style) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete(task.id);
        }}
        className={clsx(
          'mt-0.5 flex-shrink-0 w-[18px] h-[18px] rounded-full border-[1.5px] flex items-center justify-center transition-all cursor-pointer',
          pColor.border,
          isCompleted ? 'bg-gray-400 border-gray-400 text-white' : pColor.hoverBg
        )}
        title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        <Check
          className={clsx(
            'w-2.5 h-2.5 transition-opacity stroke-[3]',
            isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
        />
      </button>

      {/* Main Content & Metadata */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          {/* Title */}
          <span
            className={clsx(
              'text-[14px] leading-snug text-gray-900 dark:text-gray-100 font-normal break-words',
              isCompleted && 'line-through text-gray-400'
            )}
          >
            {task.content}
          </span>

          {/* Project Tag on the right with colored # */}
          {projectName && (
            <span className="flex-shrink-0 inline-flex items-center gap-1 text-[12px] text-gray-400 dark:text-gray-500 font-normal">
              <span>{projectName}</span>
              <Hash
                className="w-3 h-3 stroke-[2.5]"
                style={{ color: projectColor || '#1F91EB' }}
              />
            </span>
          )}
        </div>

        {/* Description line if any */}
        {task.description && (
          <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-normal">
            {task.description}
          </p>
        )}

        {/* Bottom Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-500">
          {/* Sub-tasks count */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <ListTree className="w-3 h-3 text-gray-400" />
              <span>
                {task.subtasks.filter((st) => st.completed_at).length}/{task.subtasks.length}
              </span>
            </span>
          )}

          {/* Due date or timed due */}
          {dueDateStr && (
            <span
              className={clsx(
                'inline-flex items-center gap-1',
                isOverdue ? 'text-red-600 font-medium' : 'text-emerald-600'
              )}
            >
              <Calendar className="w-3 h-3" />
              <span>{task.due_at ? new Date(task.due_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : dueDateStr}</span>
            </span>
          )}

          {/* Hard Deadline */}
          {task.deadline && (
            <span className="inline-flex items-center gap-1 text-rose-600">
              <Clock className="w-3 h-3" />
              <span>{task.deadline}</span>
            </span>
          )}

          {/* Comments count */}
          {task.comments_count ? (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments_count}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

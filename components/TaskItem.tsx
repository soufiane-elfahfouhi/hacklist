'use client';

import React from 'react';
import { Task, Priority } from '@/lib/types';
import { Check, Calendar, MessageSquare, ListTree, Flag, Clock } from 'lucide-react';
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

  const priorityColors: Record<Priority, { border: string; bg: string; text: string }> = {
    1: { border: 'border-[#d1453b]', bg: 'hover:bg-[#d1453b]/10 text-[#d1453b]', text: 'text-[#d1453b]' },
    2: { border: 'border-[#eb8909]', bg: 'hover:bg-[#eb8909]/10 text-[#eb8909]', text: 'text-[#eb8909]' },
    3: { border: 'border-[#246fe0]', bg: 'hover:bg-[#246fe0]/10 text-[#246fe0]', text: 'text-[#246fe0]' },
    4: { border: 'border-[#808080]', bg: 'hover:bg-[#808080]/10 text-[#808080]', text: 'text-[#808080]' },
  };

  const pColor = priorityColors[task.priority] || priorityColors[4];

  // Due date styling
  const todayStr = '2026-10-31';
  const dueDateStr = task.due_date || (task.due_at ? task.due_at.split('T')[0] : null);
  const isOverdue = dueDateStr && dueDateStr < todayStr && !isCompleted;
  const isDueToday = dueDateStr === todayStr && !isCompleted;

  let dueBadgeColor = 'text-gray-500 bg-gray-100 dark:bg-gray-800';
  if (isOverdue) dueBadgeColor = 'text-red-600 bg-red-50 dark:bg-red-950/40';
  else if (isDueToday) dueBadgeColor = 'text-[#eb8909] bg-amber-50 dark:bg-amber-950/40';

  return (
    <div
      style={{ marginLeft: `${depth * 24}px` }}
      className={clsx(
        'group flex items-start gap-3 py-2 px-2.5 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-800 hover:bg-gray-50/70 dark:hover:bg-neutral-900/50 transition-all cursor-pointer select-none',
        isCompleted && 'opacity-60'
      )}
      onClick={() => onClick(task)}
    >
      {/* Priority Completion Circle Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete(task.id);
        }}
        className={clsx(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
          pColor.border,
          isCompleted ? 'bg-gray-400 border-gray-400 text-white' : pColor.bg
        )}
        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
      >
        <Check
          className={clsx(
            'w-3 h-3 transition-opacity',
            isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
          strokeWidth={3}
        />
      </button>

      {/* Main Content & Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              'text-[14px] leading-snug font-normal text-gray-900 dark:text-gray-100 break-words',
              isCompleted && 'line-through text-gray-400 dark:text-gray-500'
            )}
          >
            {task.content}
          </span>
        </div>

        {task.description && (
          <p className="text-[12px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5 font-normal">
            {task.description}
          </p>
        )}

        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
          {/* Due date */}
          {dueDateStr && (
            <span className={clsx('inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-medium', dueBadgeColor)}>
              <Calendar className="w-3 h-3" />
              {dueDateStr}
              {task.recurrence && <span title="Recurring task">↻</span>}
            </span>
          )}

          {/* Deadline */}
          {task.deadline && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-rose-600 bg-rose-50 dark:bg-rose-950/40 font-medium">
              <Clock className="w-3 h-3" />
              Deadline: {task.deadline}
            </span>
          )}

          {/* Project tag (if shown in inbox/today view) */}
          {projectName && (
            <span className="inline-flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: projectColor || '#1F91EB' }}
              />
              {projectName}
            </span>
          )}

          {/* Sub-tasks count */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <ListTree className="w-3 h-3" />
              {task.subtasks.filter(st => st.completed_at).length}/{task.subtasks.length}
            </span>
          )}

          {/* Comments count */}
          {task.comments_count ? (
            <span className="inline-flex items-center gap-1 text-gray-400">
              <MessageSquare className="w-3 h-3" />
              {task.comments_count}
            </span>
          ) : null}

          {/* Labels */}
          {task.labels?.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: `${label.color}15`,
                color: label.color,
              }}
            >
              #{label.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

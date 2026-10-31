'use client';

import React from 'react';
import { Task, Priority } from '@/lib/types';
import {
  Check,
  Calendar,
  MessageSquare,
  ListTree,
  Clock,
  GripVertical,
  Edit2,
  MoreHorizontal,
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
    1: { border: 'border-[#d1453b]', hoverBg: 'hover:bg-[#d1453b]/15 text-[#d1453b]', text: 'text-[#d1453b]' },
    2: { border: 'border-[#eb8909]', hoverBg: 'hover:bg-[#eb8909]/15 text-[#eb8909]', text: 'text-[#eb8909]' },
    3: { border: 'border-[#246fe0]', hoverBg: 'hover:bg-[#246fe0]/15 text-[#246fe0]', text: 'text-[#246fe0]' },
    4: { border: 'border-[#808080]', hoverBg: 'hover:bg-[#808080]/15 text-[#808080]', text: 'text-[#808080]' },
  };

  const pColor = priorityColors[task.priority] || priorityColors[4];

  const todayStr = '2026-10-31';
  const dueDateStr = task.due_date || (task.due_at ? task.due_at.split('T')[0] : null);
  const isOverdue = dueDateStr && dueDateStr < todayStr && !isCompleted;
  const isDueToday = dueDateStr === todayStr && !isCompleted;

  let dueBadgeColor = 'text-gray-500';
  if (isOverdue) dueBadgeColor = 'text-[#d1453b] font-medium';
  else if (isDueToday) dueBadgeColor = 'text-[#058527] font-medium';

  return (
    <div
      style={{ marginLeft: `${depth * 24}px` }}
      className={clsx(
        'group relative flex items-start gap-2.5 py-2 px-1 border-b border-gray-100 dark:border-neutral-800/80 hover:bg-gray-50/70 dark:hover:bg-neutral-800/40 rounded-sm transition-colors cursor-pointer select-none',
        isCompleted && 'opacity-60'
      )}
      onClick={() => onClick(task)}
    >
      {/* 6-dot drag handle on hover (left edge) */}
      <div className="w-3 flex items-center justify-center -ml-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Todoist 20px Priority Checkbox */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onComplete(task.id);
        }}
        className={clsx(
          'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer',
          pColor.border,
          isCompleted ? 'bg-gray-400 border-gray-400 text-white' : pColor.hoverBg
        )}
        title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
      >
        <Check
          className={clsx(
            'w-3 h-3 transition-opacity',
            isCompleted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          )}
          strokeWidth={3}
        />
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0 pr-2">
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

        {/* Metadata Badges line */}
        <div className="flex flex-wrap items-center gap-2.5 mt-1 text-[11px]">
          {/* Due date */}
          {dueDateStr && (
            <span className={clsx('inline-flex items-center gap-1 text-[11px]', dueBadgeColor)}>
              <Calendar className="w-3 h-3" />
              <span>{isDueToday ? 'Today' : dueDateStr}</span>
              {task.recurrence && <span title="Recurring task">↻</span>}
            </span>
          )}

          {/* Hard Deadline */}
          {task.deadline && (
            <span className="inline-flex items-center gap-1 text-rose-600 font-medium text-[11px]">
              <Clock className="w-3 h-3" />
              <span>Deadline: {task.deadline}</span>
            </span>
          )}

          {/* Subtasks Progress */}
          {task.subtasks && task.subtasks.length > 0 && (
            <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
              <ListTree className="w-3 h-3" />
              <span>
                {task.subtasks.filter((st) => st.completed_at).length}/{task.subtasks.length}
              </span>
            </span>
          )}

          {/* Comments count */}
          {task.comments_count ? (
            <span className="inline-flex items-center gap-1 text-gray-400 text-[11px]">
              <MessageSquare className="w-3 h-3" />
              <span>{task.comments_count}</span>
            </span>
          ) : null}

          {/* Project tag (shown in Today / Inbox view) */}
          {projectName && (
            <span className="inline-flex items-center gap-1.5 text-gray-400 text-[11px] ml-auto">
              <span>{projectName}</span>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: projectColor || '#1F91EB' }}
              />
            </span>
          )}
        </div>
      </div>

      {/* Quick Action Icons on Row Hover (Far Right) */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-gray-400">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(task);
          }}
          className="p-1 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
          title="Edit task"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(task);
          }}
          className="p-1 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
          title="Due date"
        >
          <Calendar className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick(task);
          }}
          className="p-1 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-neutral-700 rounded transition-colors cursor-pointer"
          title="More actions"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

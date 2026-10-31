'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { BoardView } from '@/components/BoardView';
import { CalendarView } from '@/components/CalendarView';
import { ViewStyle } from '@/lib/types';
import { Plus, CheckCircle2, SlidersHorizontal, Check, List, LayoutGrid, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function TodayPage() {
  const { tasks, projects, sections, completeTask, setSelectedTask, createTask, createSection, updateTask } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('list');
  const [todayDateStr, setTodayDateStr] = useState('2026-10-31');
  const [formattedDate, setFormattedDate] = useState('Saturday, October 31');

  useEffect(() => {
    const now = new Date();
    setTodayDateStr(now.toISOString().split('T')[0]);
    setFormattedDate(format(now, 'EEE d MMM'));
  }, []);

  // Overdue tasks
  const overdueTasks = tasks.filter((t) => {
    if (t.completed_at) return false;
    const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
    return d && d < todayDateStr;
  });

  // Today's tasks
  const todayTasks = tasks.filter((t) => {
    if (t.completed_at) return false;
    const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
    return d === todayDateStr;
  });

  const completedToday = tasks.filter((t) => {
    return t.completed_at && t.completed_at.startsWith(todayDateStr);
  });

  const inboxProject = projects.find((p) => p.is_inbox) || projects[0];
  const allActiveTodayTasks = [...overdueTasks, ...todayTasks];

  return (
    <div className="h-full flex flex-col">
      {/* Todoist-exact View Header */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-baseline justify-between select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Today
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-normal">
            <div className="flex items-center gap-1 text-gray-400">
              <Check className="w-3.5 h-3.5" />
              <span>{todayTasks.length} tasks</span>
            </div>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* View Switcher: List / Board / Calendar */}
        <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5 text-xs font-semibold">
          <button
            onClick={() => setViewStyle('list')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer',
              viewStyle === 'list'
                ? 'bg-white dark:bg-neutral-700 text-[#1F91EB] shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewStyle('board')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer',
              viewStyle === 'board'
                ? 'bg-white dark:bg-neutral-700 text-[#1F91EB] shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Board</span>
          </button>
          <button
            onClick={() => setViewStyle('calendar')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1 rounded-md transition-all cursor-pointer',
              viewStyle === 'calendar'
                ? 'bg-white dark:bg-neutral-700 text-[#1F91EB] shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-y-auto">
        {viewStyle === 'board' ? (
          <BoardView
            projectId={inboxProject?.id || 'inbox'}
            sections={sections}
            tasks={allActiveTodayTasks}
            onCompleteTask={completeTask}
            onSelectTask={setSelectedTask}
            onCreateTask={createTask}
            onCreateSection={(name) => createSection(inboxProject?.id || 'inbox', name)}
          />
        ) : viewStyle === 'calendar' ? (
          <CalendarView
            tasks={allActiveTodayTasks}
            onSelectTask={setSelectedTask}
            onTimeBlockTask={async (taskId, dueAt, durationMin) => {
              await updateTask(taskId, { dueAt, durationMin });
            }}
          />
        ) : (
          /* List View (800px max width centered) */
          <div className="max-w-[800px] mx-auto pt-6 pb-20 px-8 space-y-6">
            {/* Overdue Section */}
            {overdueTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-1 border-b border-red-200 dark:border-red-950/60 text-xs font-bold text-red-600 dark:text-red-400">
                  <span>Overdue</span>
                  <span className="text-[11px] font-semibold text-red-400">{overdueTasks.length}</span>
                </div>
                <div className="space-y-0.5 pt-1">
                  {overdueTasks.map((t) => {
                    const proj = projects.find((p) => p.id === t.project_id);
                    return (
                      <TaskItem
                        key={t.id}
                        task={t}
                        projectName={proj?.name}
                        projectColor={proj?.color}
                        onComplete={completeTask}
                        onClick={setSelectedTask}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Today Section */}
            <div className="space-y-1">
              <div className="space-y-0.5">
                {todayTasks.length === 0 && overdueTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs select-none">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">All tasks completed for today!</p>
                    <p className="mt-0.5">Enjoy your day or add a new task below.</p>
                  </div>
                ) : (
                  todayTasks.map((t) => {
                    const proj = projects.find((p) => p.id === t.project_id);
                    return (
                      <TaskItem
                        key={t.id}
                        task={t}
                        projectName={proj?.name}
                        projectColor={proj?.color}
                        onComplete={completeTask}
                        onClick={setSelectedTask}
                      />
                    );
                  })
                )}
              </div>

              {/* Inline Add Task Form (Todoist exact expandable) */}
              {isAdding ? (
                <div className="pt-2">
                  <TaskEditor
                    projectId={inboxProject?.id || 'inbox'}
                    onSave={async (data) => {
                      await createTask({ ...data, dueDate: todayDateStr });
                      setIsAdding(false);
                    }}
                    onCancel={() => setIsAdding(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 py-2 px-1 text-xs font-medium text-gray-500 hover:text-[#1F91EB] transition-colors cursor-pointer group"
                >
                  <Plus className="w-4 h-4 text-[#1F91EB] group-hover:scale-110 transition-transform" />
                  <span className="group-hover:text-[#1F91EB]">Add task</span>
                </button>
              )}
            </div>

            {/* Completed Tasks Accordion */}
            {completedToday.length > 0 && (
              <div className="pt-6 border-t border-gray-100 dark:border-neutral-800">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-2 cursor-pointer mb-2"
                >
                  <span>Completed ({completedToday.length})</span>
                </button>
                {showCompleted && (
                  <div className="space-y-0.5">
                    {completedToday.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onComplete={completeTask}
                    onClick={setSelectedTask}
                  />
                ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

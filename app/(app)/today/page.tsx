'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { BoardView } from '@/components/BoardView';
import { CalendarView } from '@/components/CalendarView';
import { ViewStyle } from '@/lib/types';
import {
  Plus,
  CheckCircle2,
  Check,
  Calendar,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  X,
  List,
  LayoutGrid,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function TodayPage() {
  const { tasks, projects, sections, completeTask, setSelectedTask, createTask, createSection, updateTask } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showCalendarBanner, setShowCalendarBanner] = useState(true);
  const [showDisplayMenu, setShowDisplayMenu] = useState(false);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('list');
  const [todayDateStr, setTodayDateStr] = useState('2026-10-31');
  const [formattedDate, setFormattedDate] = useState('Saturday, October 31');
  const [dayHeaderStr, setDayHeaderStr] = useState('31 Oct · Today · Saturday');

  useEffect(() => {
    const now = new Date();
    setTodayDateStr(now.toISOString().split('T')[0]);
    setFormattedDate(format(now, 'EEE d MMM'));
    setDayHeaderStr(`${format(now, 'd MMM')} · Today · ${format(now, 'EEEE')}`);
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
    <div className="h-full flex flex-col font-sans select-none">
      {/* Top Bar Right Actions: Connect Calendar Pill & Display Button */}
      <div className="flex items-center justify-end gap-2 px-8 pt-5 pb-2">
        {/* Connect Calendar Pill Button (from Mobbin screen) */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 hover:bg-gray-200/80 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-lg transition-colors cursor-pointer">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <span>Connect calendar</span>
          <button className="hover:text-black dark:hover:text-white p-0.5 ml-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Display / View Switcher Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setShowDisplayMenu(!showDisplayMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Display</span>
          </button>

          {showDisplayMenu && (
            <div className="absolute right-0 top-full mt-1 z-30 p-1.5 bg-white dark:bg-[#242424] border border-gray-200 dark:border-neutral-700 rounded-xl shadow-lg w-44 space-y-1">
              <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Layout
              </div>
              <button
                onClick={() => {
                  setViewStyle('list');
                  setShowDisplayMenu(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
                  viewStyle === 'list'
                    ? 'bg-[#1F91EB]/10 text-[#1F91EB]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                )}
              >
                <List className="w-3.5 h-3.5" />
                <span>List view</span>
              </button>
              <button
                onClick={() => {
                  setViewStyle('board');
                  setShowDisplayMenu(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
                  viewStyle === 'board'
                    ? 'bg-[#1F91EB]/10 text-[#1F91EB]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Board view</span>
              </button>
              <button
                onClick={() => {
                  setViewStyle('calendar');
                  setShowDisplayMenu(false);
                }}
                className={clsx(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer',
                  viewStyle === 'calendar'
                    ? 'bg-[#1F91EB]/10 text-[#1F91EB]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-700'
                )}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Calendar view</span>
              </button>
            </div>
          )}
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
          /* List View (Exact Todoist Web layout) */
          <div className="max-w-[800px] mx-auto pt-2 pb-20 px-8 space-y-5">
            {/* Page Title & Count Subtitle */}
            <div>
              <h1 className="text-[26px] font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Today
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5 text-[12px] text-gray-500 font-normal">
                <Check className="w-3.5 h-3.5 text-gray-400" />
                <span>{todayTasks.length} tasks</span>
              </div>
            </div>

            {/* Google Calendar Time-Strip Integration Banner (Exact Mobbin feature) */}
            {showCalendarBanner && (
              <div className="bg-[#fcf7ee] dark:bg-[#2a241b] border-l-2 border-[#e8a338] rounded-md px-3 py-2 flex items-center justify-between text-xs text-gray-700 dark:text-gray-200">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-[11px]">13:00-13:45</span>
                    <span className="font-medium">User Interview & Product Planning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono text-[11px]">17:00-17:30</span>
                    <span className="font-medium">Antigravity Sync Review</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowCalendarBanner(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* 1. Overdue Section (if any overdue tasks) */}
            {overdueTasks.length > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-neutral-800 text-xs font-bold text-gray-900 dark:text-gray-100">
                  <div className="flex items-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    <span>Overdue</span>
                  </div>
                  <button className="text-xs font-semibold text-[#1F91EB] hover:underline cursor-pointer">
                    Reschedule
                  </button>
                </div>
                <div>
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

            {/* 2. Today Day Header & Task List */}
            <div className="space-y-1 pt-1">
              <div className="pb-1 border-b border-gray-100 dark:border-neutral-800 text-xs font-bold text-gray-900 dark:text-gray-100">
                <span>{dayHeaderStr}</span>
              </div>

              <div>
                {todayTasks.length === 0 && overdueTasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                    <p className="font-semibold text-gray-700 dark:text-gray-300">All tasks completed for today!</p>
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

              {/* Inline Add Task Form */}
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
                  <Plus className="w-4 h-4 text-[#1F91EB] stroke-[2.5]" />
                  <span className="group-hover:text-[#1F91EB]">Add task</span>
                </button>
              )}
            </div>

            {/* Completed Section (collapsible) */}
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

'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { Plus, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export default function TodayPage() {
  const { tasks, projects, completeTask, setSelectedTask, createTask } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [todayDateStr, setTodayDateStr] = useState('2026-10-31');
  const [formattedDate, setFormattedDate] = useState('Saturday, October 31');

  useEffect(() => {
    const now = new Date();
    setTodayDateStr(now.toISOString().split('T')[0]);
    setFormattedDate(format(now, 'EEEE, MMMM d'));
  }, []);

  // Overdue tasks: due before today, not completed
  const overdueTasks = tasks.filter((t) => {
    if (t.completed_at) return false;
    const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
    return d && d < todayDateStr;
  });

  // Today's tasks: due today, not completed
  const todayTasks = tasks.filter((t) => {
    if (t.completed_at) return false;
    const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
    return d === todayDateStr;
  });

  // Completed today
  const completedToday = tasks.filter((t) => {
    return t.completed_at && t.completed_at.startsWith(todayDateStr);
  });

  const inboxProject = projects.find((p) => p.is_inbox) || projects[0];

  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-20 px-8">
      {/* View Header */}
      <div className="flex items-baseline justify-between pb-6 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Today</h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 pb-1 border-b border-red-200 dark:border-red-950/60 text-xs font-bold text-red-600 dark:text-red-400">
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

        {/* Today's Tasks Section */}
        <div className="space-y-1">
          <div className="space-y-0.5">
            {todayTasks.length === 0 && overdueTasks.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
                <p className="font-semibold text-gray-700 dark:text-gray-300">All clear for today!</p>
                <p className="mt-0.5">Enjoy your day or add a task below.</p>
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
              className="flex items-center gap-2 py-2 px-2.5 text-xs font-medium text-gray-500 hover:text-[#1F91EB] dark:hover:text-[#5BADEE] transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#1F91EB]" />
              <span>Add task</span>
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
    </div>
  );
}

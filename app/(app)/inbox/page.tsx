'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { BoardView } from '@/components/BoardView';
import { ViewStyle } from '@/lib/types';
import { Plus, Inbox as InboxIcon, List, LayoutGrid, Check } from 'lucide-react';
import clsx from 'clsx';

export default function InboxPage() {
  const { tasks, projects, sections, completeTask, setSelectedTask, createTask, createSection } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewStyle, setViewStyle] = useState<ViewStyle>('list');

  const inboxProject = projects.find((p) => p.is_inbox) || projects[0];
  const inboxTasks = tasks.filter(
    (t) => t.project_id === inboxProject?.id && !t.completed_at
  );
  const completedTasks = tasks.filter(
    (t) => t.project_id === inboxProject?.id && !!t.completed_at
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-gray-100 dark:border-neutral-800 flex items-baseline justify-between select-none">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <span>Inbox</span>
          </h1>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-normal">
            <div className="flex items-center gap-1 text-gray-400">
              <Check className="w-3.5 h-3.5" />
              <span>{inboxTasks.length} tasks</span>
            </div>
          </div>
        </div>

        {/* View Switcher: List / Board */}
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
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewStyle === 'board' ? (
          <BoardView
            projectId={inboxProject?.id || 'inbox'}
            sections={sections}
            tasks={inboxTasks}
            onCompleteTask={completeTask}
            onSelectTask={setSelectedTask}
            onCreateTask={createTask}
            onCreateSection={(name) => createSection(inboxProject?.id || 'inbox', name)}
          />
        ) : (
          <div className="max-w-[800px] mx-auto pt-6 pb-20 px-8 space-y-4">
            {/* Active tasks */}
            <div className="space-y-0.5">
              {inboxTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  <InboxIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-[#246fe0]" />
                  <p className="font-semibold text-gray-700 dark:text-gray-300">Your inbox is clear.</p>
                  <p className="mt-0.5">Add a task below to capture your thoughts.</p>
                </div>
              ) : (
                inboxTasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onComplete={completeTask}
                    onClick={setSelectedTask}
                  />
                ))
              )}
            </div>

            {/* Inline Task Add */}
            {isAdding ? (
              <div className="pt-2">
                <TaskEditor
                  projectId={inboxProject?.id || 'inbox'}
                  onSave={async (data) => {
                    await createTask({ ...data, projectId: inboxProject?.id });
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

            {/* Completed */}
            {completedTasks.length > 0 && (
              <div className="pt-6 border-t border-gray-100 dark:border-neutral-800">
                <button
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex items-center gap-2 cursor-pointer mb-2"
                >
                  <span>Completed ({completedTasks.length})</span>
                </button>
                {showCompleted && (
                  <div className="space-y-0.5">
                    {completedTasks.map((t) => (
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

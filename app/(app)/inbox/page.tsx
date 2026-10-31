'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { Plus, Inbox as InboxIcon } from 'lucide-react';

export default function InboxPage() {
  const { tasks, projects, completeTask, setSelectedTask, createTask } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const inboxProject = projects.find((p) => p.is_inbox) || projects[0];
  const inboxTasks = tasks.filter(
    (t) => t.project_id === inboxProject?.id && !t.completed_at
  );
  const completedTasks = tasks.filter(
    (t) => t.project_id === inboxProject?.id && !!t.completed_at
  );

  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-20 px-8">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-6 border-b border-gray-100 dark:border-neutral-800">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <InboxIcon className="w-6 h-6 text-[#1F91EB]" />
            <span>Inbox</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Capture everything on your mind. Triage and assign to projects later.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {/* Active tasks */}
        <div className="space-y-0.5">
          {inboxTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              <InboxIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
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
            className="flex items-center gap-2 py-2 px-2.5 text-xs font-medium text-gray-500 hover:text-[#1F91EB] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#1F91EB]" />
            <span>Add task</span>
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
    </div>
  );
}

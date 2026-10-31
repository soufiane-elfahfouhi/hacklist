'use client';

import React, { useState, use, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { TaskEditor } from '@/components/TaskEditor';
import { BoardView } from '@/components/BoardView';
import { CalendarView } from '@/components/CalendarView';
import { ViewStyle } from '@/lib/types';
import { List, LayoutGrid, Calendar as CalendarIcon, Plus } from 'lucide-react';
import clsx from 'clsx';

function ProjectPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = use(params);
  const {
    projects,
    tasks,
    sections,
    completeTask,
    setSelectedTask,
    createTask,
    createSection,
    updateTask,
  } = useApp();

  const [viewStyle, setViewStyle] = useState<ViewStyle>('list');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.project_id === projectId);
  const activeTasks = projectTasks.filter((t) => !t.completed_at);
  const projectSections = sections.filter((s) => s.project_id === projectId);

  if (!project) {
    return (
      <div className="p-10 text-center text-gray-400 text-xs">
        Project not found.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Project Top Bar */}
      <div className="px-8 py-5 border-b border-gray-100 dark:border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="w-3.5 h-3.5 rounded-full"
            style={{ backgroundColor: project.color || '#1F91EB' }}
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {project.name}
          </h1>
          <span className="text-xs text-gray-400 font-semibold">{activeTasks.length}</span>
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

      {/* View Content */}
      <div className="flex-1 overflow-y-auto">
        {viewStyle === 'board' ? (
          <BoardView
            projectId={project.id}
            sections={projectSections}
            tasks={activeTasks}
            onCompleteTask={completeTask}
            onSelectTask={setSelectedTask}
            onCreateTask={createTask}
            onCreateSection={(name) => createSection(project.id, name)}
          />
        ) : viewStyle === 'calendar' ? (
          <CalendarView
            tasks={activeTasks}
            onSelectTask={setSelectedTask}
            onTimeBlockTask={async (taskId, dueAt, durationMin) => {
              await updateTask(taskId, { dueAt, durationMin });
            }}
          />
        ) : (
          /* List View (max-width 800px) */
          <div className="max-w-[800px] mx-auto pt-8 pb-20 px-8 space-y-4">
            <div className="space-y-0.5">
              {activeTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-xs">
                  No tasks in this project yet. Add one below!
                </div>
              ) : (
                activeTasks.map((t) => (
                  <TaskItem
                    key={t.id}
                    task={t}
                    onComplete={completeTask}
                    onClick={setSelectedTask}
                  />
                ))
              )}
            </div>

            {isAddingTask ? (
              <div className="pt-2">
                <TaskEditor
                  projectId={project.id}
                  onSave={async (data) => {
                    await createTask({ ...data, projectId: project.id });
                    setIsAddingTask(false);
                  }}
                  onCancel={() => setIsAddingTask(false)}
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingTask(true)}
                className="flex items-center gap-2 py-2 px-2.5 text-xs font-medium text-gray-500 hover:text-[#1F91EB] transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#1F91EB]" />
                <span>Add task</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectPage(props: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-400">Loading project...</div>}>
      <ProjectPageContent {...props} />
    </Suspense>
  );
}

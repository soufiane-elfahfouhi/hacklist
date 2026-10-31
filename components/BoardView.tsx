'use client';

import React, { useState } from 'react';
import { Task, Section, Priority } from '@/lib/types';
import { TaskItem } from './TaskItem';
import { TaskEditor } from './TaskEditor';
import { Plus, MoreHorizontal } from 'lucide-react';

interface BoardViewProps {
  projectId: string;
  sections: Section[];
  tasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onCreateTask: (params: any) => Promise<void>;
  onCreateSection: (name: string) => Promise<void>;
}

export function BoardView({
  projectId,
  sections,
  tasks,
  onCompleteTask,
  onSelectTask,
  onCreateTask,
  onCreateSection,
}: BoardViewProps) {
  const [addingTaskSectionId, setAddingTaskSectionId] = useState<string | null>(null);
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Group tasks by section
  const unsectionedTasks = tasks.filter((t) => !t.section_id);

  const handleAddSectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionName.trim()) return;
    await onCreateSection(newSectionName.trim());
    setNewSectionName('');
    setIsAddingSection(false);
  };

  return (
    <div className="flex gap-4 p-4 overflow-x-auto min-h-[calc(100vh-140px)] select-none">
      {/* 1. Unsectioned Column (if any tasks or default) */}
      <div className="w-[280px] flex-shrink-0 flex flex-col bg-gray-50/70 dark:bg-neutral-900/40 rounded-xl p-3 border border-gray-200/70 dark:border-neutral-800">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">No Section</span>
            <span className="text-[11px] text-gray-400 font-semibold">{unsectionedTasks.length}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto">
          {unsectionedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-[#242424] p-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all"
            >
              <TaskItem
                task={task}
                onComplete={onCompleteTask}
                onClick={onSelectTask}
              />
            </div>
          ))}

          {addingTaskSectionId === 'none' ? (
            <TaskEditor
              projectId={projectId}
              sectionId={null}
              onSave={async (data) => {
                await onCreateTask({ ...data, projectId, sectionId: null });
                setAddingTaskSectionId(null);
              }}
              onCancel={() => setAddingTaskSectionId(null)}
            />
          ) : (
            <button
              onClick={() => setAddingTaskSectionId('none')}
              className="w-full flex items-center gap-1.5 py-1.5 px-2 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add task</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. User Sections Columns */}
      {sections.map((sec) => {
        const secTasks = tasks.filter((t) => t.section_id === sec.id);
        return (
          <div
            key={sec.id}
            className="w-[280px] flex-shrink-0 flex flex-col bg-gray-50/70 dark:bg-neutral-900/40 rounded-xl p-3 border border-gray-200/70 dark:border-neutral-800"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">{sec.name}</span>
                <span className="text-[11px] text-gray-400 font-semibold">{secTasks.length}</span>
              </div>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {secTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-[#242424] p-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 shadow-xs hover:shadow-sm transition-all"
                >
                  <TaskItem
                    task={task}
                    onComplete={onCompleteTask}
                    onClick={onSelectTask}
                  />
                </div>
              ))}

              {addingTaskSectionId === sec.id ? (
                <TaskEditor
                  projectId={projectId}
                  sectionId={sec.id}
                  onSave={async (data) => {
                    await onCreateTask({ ...data, projectId, sectionId: sec.id });
                    setAddingTaskSectionId(null);
                  }}
                  onCancel={() => setAddingTaskSectionId(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingTaskSectionId(sec.id)}
                  className="w-full flex items-center gap-1.5 py-1.5 px-2 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-lg transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add task</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* 3. Add Section Column */}
      <div className="w-[240px] flex-shrink-0">
        {isAddingSection ? (
          <form
            onSubmit={handleAddSectionSubmit}
            className="p-3 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-300 dark:border-neutral-700"
          >
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              placeholder="Name this section..."
              autoFocus
              className="w-full text-xs p-2 bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md focus:outline-none mb-2"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={!newSectionName.trim()}
                className="px-3 py-1 bg-[#1F91EB] text-white text-xs font-medium rounded-md hover:bg-[#5BADEE] cursor-pointer"
              >
                Add section
              </button>
              <button
                type="button"
                onClick={() => setIsAddingSection(false)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAddingSection(true)}
            className="w-full flex items-center gap-2 p-3 text-xs font-semibold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 border-2 border-dashed border-gray-200 dark:border-neutral-800 hover:border-gray-300 rounded-xl transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add section</span>
          </button>
        )}
      </div>
    </div>
  );
}

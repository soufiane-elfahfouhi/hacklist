'use client';

import React, { useState, Suspense } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import { Sidebar } from '@/components/Sidebar';
import { TaskModal } from '@/components/TaskModal';
import { TaskEditor } from '@/components/TaskEditor';
import { SettingsModal } from '@/components/SettingsModal';
import { PanelLeft, X } from 'lucide-react';

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const {
    projects,
    counts,
    profile,
    selectedTask,
    setSelectedTask,
    isQuickAddOpen,
    setIsQuickAddOpen,
    createTask,
    updateTask,
    completeTask,
    deleteTask,
    createProject,
  } = useApp();

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#1F91EB');

  const handleAddProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    await createProject(newProjectName.trim(), newProjectColor);
    setNewProjectName('');
    setIsAddProjectOpen(false);
  };

  const projectColors = ['#1F91EB', '#5BADEE', '#246fe0', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#1a1a1a]">
      {/* Collapsible Sidebar (280px, exact Todoist Web design) */}
      {isSidebarOpen ? (
        <Suspense fallback={<div className="w-[280px] h-full bg-[#fcfaf8] dark:bg-[#1a1a1a]" />}>
          <Sidebar
            projects={projects}
            counts={counts}
            profile={profile}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onOpenAddProject={() => setIsAddProjectOpen(true)}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onToggleCollapse={() => setIsSidebarOpen(false)}
          />
        </Suspense>
      ) : (
        <div className="p-3">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-1.5 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-black/5 dark:hover:bg-white/5 rounded-md cursor-pointer transition-colors"
            title="Expand sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#1f1f1f]">
        {children}
      </main>

      {/* Settings Modal (Matching Mobbin Calendars/Settings) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userEmail={profile?.email || 'soufiane.elfahfouhi@gmail.com'}
        userName={profile?.full_name || 'Samlee'}
      />

      {/* Task Detail Modal (864px split view) */}
      <TaskModal
        task={selectedTask}
        projects={projects}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
        onAddSubtask={async (parentId, content) => {
          await createTask({
            content,
            projectId: selectedTask?.project_id,
            sectionId: selectedTask?.section_id,
          });
        }}
        onCompleteTask={completeTask}
      />

      {/* Global Quick Add Modal */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#202020] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 p-4 animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-neutral-800">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Quick Add Task</span>
              <button
                onClick={() => setIsQuickAddOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <TaskEditor
              projectId={projects.find((p) => p.is_inbox)?.id || projects[0]?.id || 'inbox'}
              onSave={async (data) => {
                await createTask(data);
                setIsQuickAddOpen(false);
              }}
              onCancel={() => setIsQuickAddOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {isAddProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white dark:bg-[#202020] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 p-5">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-3">Add Project</h3>
            <form onSubmit={handleAddProjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Project name"
                  autoFocus
                  className="w-full text-xs p-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-[#1F91EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Color</label>
                <div className="flex items-center gap-2">
                  {projectColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewProjectColor(c)}
                      className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                        newProjectColor === c ? 'scale-120 ring-2 ring-offset-2 ring-[#1F91EB]' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newProjectName.trim()}
                  className="px-3.5 py-1.5 bg-[#1F91EB] hover:bg-[#5BADEE] text-white text-xs font-medium rounded-md cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </AppProvider>
  );
}

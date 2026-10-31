'use client';

import React, { useState, useEffect } from 'react';
import { Task, Project, Priority, Comment } from '@/lib/types';
import {
  X,
  Calendar,
  Flag,
  Trash2,
  Clock,
  ListTree,
  MessageSquare,
  Plus,
  Send,
  Check,
} from 'lucide-react';
import clsx from 'clsx';

interface TaskModalProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (parentId: string, content: string) => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
}

export function TaskModal({
  task,
  projects,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onAddSubtask,
  onCompleteTask,
}: TaskModalProps) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [recurrence, setRecurrence] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setDescription(task.description || '');
      setPriority(task.priority);
      setProjectId(task.project_id);
      setDueDate(task.due_date || (task.due_at ? task.due_at.split('T')[0] : ''));
      setDeadline(task.deadline || '');
      setRecurrence(task.recurrence || '');
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSaveField = async (fields: any) => {
    await onUpdate(task.id, fields);
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    await onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
  };

  const priorityOptions: { value: Priority; label: string; color: string }[] = [
    { value: 1, label: 'Priority 1 (Red)', color: 'text-[#d1453b]' },
    { value: 2, label: 'Priority 2 (Orange)', color: 'text-[#eb8909]' },
    { value: 3, label: 'Priority 3 (Blue)', color: 'text-[#246fe0]' },
    { value: 4, label: 'Priority 4 (Grey)', color: 'text-gray-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      {/* 864px modal card (matching Todoist specification) */}
      <div className="w-full max-w-[864px] max-h-[90vh] bg-white dark:bg-[#202020] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: projects.find((p) => p.id === projectId)?.color || '#1F91EB',
              }}
            />
            <span>{projects.find((p) => p.id === projectId)?.name || 'Project'}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-all cursor-pointer"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body - 65% Main Content / 35% Side Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Main Left Section */}
          <div className="md:col-span-8 p-6 space-y-5 border-r border-gray-100 dark:border-neutral-800">
            {/* Task Content / Title */}
            <div>
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onBlur={() => handleSaveField({ content })}
                className="w-full text-lg font-bold text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none"
                placeholder="Task title"
              />
            </div>

            {/* Description */}
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => handleSaveField({ description })}
                placeholder="Description / notes..."
                rows={3}
                className="w-full text-sm text-gray-700 dark:text-gray-300 bg-transparent focus:outline-none resize-none placeholder-gray-400"
              />
            </div>

            {/* Sub-tasks Section */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                <ListTree className="w-3.5 h-3.5" />
                <span>Sub-tasks</span>
              </div>

              <div className="space-y-1 mb-2">
                {task.subtasks?.map((st) => (
                  <div
                    key={st.id}
                    className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800/60 group"
                  >
                    <button
                      onClick={() => onCompleteTask(st.id)}
                      className="w-4 h-4 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer"
                    >
                      {st.completed_at && <Check className="w-3 h-3 text-[#1F91EB]" />}
                    </button>
                    <span
                      className={clsx(
                        'text-xs flex-1',
                        st.completed_at
                          ? 'line-through text-gray-400'
                          : 'text-gray-800 dark:text-gray-200'
                      )}
                    >
                      {st.content}
                    </span>
                  </div>
                ))}
              </div>

              {/* Add subtask input */}
              <form onSubmit={handleAddSubtaskSubmit} className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a sub-task..."
                  className="flex-1 text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md focus:outline-none focus:border-[#1F91EB]"
                />
                <button
                  type="submit"
                  disabled={!newSubtask.trim()}
                  className="px-2.5 py-1.5 bg-[#1F91EB] text-white text-xs font-medium rounded-md hover:bg-[#5BADEE] disabled:opacity-50 cursor-pointer"
                >
                  Add
                </button>
              </form>
            </div>
          </div>

          {/* Right Meta Panel (35%) */}
          <div className="md:col-span-4 p-5 bg-gray-50/60 dark:bg-neutral-900/40 space-y-4 text-xs">
            {/* Project Picker */}
            <div>
              <label className="block text-gray-500 font-medium mb-1">Project</label>
              <select
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  handleSaveField({ projectId: e.target.value });
                }}
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date & Recurrence */}
            <div>
              <label className="block text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>Due Date</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  handleSaveField({ dueDate: e.target.value || null });
                }}
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>

            {/* Recurrence Rule */}
            <div>
              <label className="block text-gray-500 font-medium mb-1">Recurrence</label>
              <select
                value={recurrence}
                onChange={(e) => {
                  setRecurrence(e.target.value);
                  handleSaveField({ recurrence: e.target.value || null });
                }}
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:outline-none"
              >
                <option value="">Does not repeat</option>
                <option value="FREQ=DAILY">Daily</option>
                <option value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Weekdays (Mon-Fri)</option>
                <option value="FREQ=WEEKLY">Weekly</option>
                <option value="FREQ=MONTHLY">Monthly</option>
              </select>
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-500" />
                <span>Hard Deadline</span>
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => {
                  setDeadline(e.target.value);
                  handleSaveField({ deadline: e.target.value || null });
                }}
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:outline-none"
              />
            </div>

            {/* Priority Picker */}
            <div>
              <label className="block text-gray-500 font-medium mb-1 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-gray-400" />
                <span>Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  const p = Number(e.target.value) as Priority;
                  setPriority(p);
                  handleSaveField({ priority: p });
                }}
                className="w-full bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg p-2 text-gray-800 dark:text-gray-200 focus:outline-none font-medium"
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

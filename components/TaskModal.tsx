'use client';

import React, { useState, useEffect } from 'react';
import { Task, Project, Priority, Comment } from '@/lib/types';
import {
  X,
  Calendar as CalendarIcon,
  Flag,
  Trash2,
  Clock,
  ListTree,
  MessageSquare,
  Plus,
  Send,
  Check,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Paperclip,
  Mic,
  Smile,
  Boxes,
  Play,
  Pause,
  Copy,
  Printer,
  History,
  Tag,
  Bell,
  MapPin,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { DatePickerPopover } from './DatePickerPopover';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task | null;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: any) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onAddSubtask: (parentId: string, content: string) => Promise<void>;
  onCompleteTask: (taskId: string) => Promise<void>;
  onNavigateTask?: (direction: 'next' | 'prev') => void;
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
  onNavigateTask,
}: TaskModalProps) {
  const [content, setContent] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>(4);
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [dueTime, setDueTime] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [recurrence, setRecurrence] = useState<string | null>(null);
  const [isSubtasksOpen, setIsSubtasksOpen] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(true);
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [toastMessage, setToMessage] = useState<string | null>(null);

  // Mock comments matching Mobbin flow
  const [comments, setComments] = useState<Array<{
    id: string;
    author: string;
    time: string;
    text: string;
    hasAudio?: boolean;
    reactions?: string[];
  }>>([
    {
      id: 'c1',
      author: 'Samlee',
      time: 'Today 16:53',
      text: 'Should be done end of this week 🚀',
      hasAudio: true,
      reactions: ['🔥 1'],
    },
  ]);

  useEffect(() => {
    if (task) {
      setContent(task.content);
      setDescription(task.description || '');
      setPriority(task.priority);
      setProjectId(task.project_id);
      setDueDate(task.due_date || (task.due_at ? task.due_at.split('T')[0] : null));
      setDueTime(task.due_at && task.due_at.includes('T') ? task.due_at.split('T')[1].slice(0, 5) : null);
      setDeadline(task.deadline || null);
      setRecurrence(task.recurrence || null);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const currentProject = projects.find((p) => p.id === projectId) || projects[0];

  const handleSaveField = async (fields: any) => {
    await onUpdate(task.id, fields);
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    await onAddSubtask(task.id, newSubtask.trim());
    setNewSubtask('');
    setIsAddingSubtask(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() && !isRecordingVoice) return;
    setComments((prev) => [
      ...prev,
      {
        id: `c_${Date.now()}`,
        author: 'You',
        time: 'Just now',
        text: newComment.trim() || 'Voice memo attached',
        hasAudio: isRecordingVoice,
      },
    ]);
    setNewComment('');
    setIsRecordingVoice(false);
  };

  const showToast = (msg: string) => {
    setToMessage(msg);
    setTimeout(() => setToMessage(null), 4000);
  };

  const priorityMeta: Record<Priority, { label: string; flagColor: string; bg: string }> = {
    1: { label: 'Priority 1', flagColor: 'text-[#d1453b]', bg: 'hover:bg-red-50' },
    2: { label: 'Priority 2', flagColor: 'text-[#eb8909]', bg: 'hover:bg-orange-50' },
    3: { label: 'Priority 3', flagColor: 'text-[#246fe0]', bg: 'hover:bg-blue-50' },
    4: { label: 'Priority 4', flagColor: 'text-gray-400', bg: 'hover:bg-gray-100' },
  };

  const completedSubtasksCount = task.subtasks?.filter((s) => !!s.completed_at).length || 0;
  const totalSubtasksCount = task.subtasks?.length || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      {/* 864px Todoist Standard Modal Card */}
      <div className="w-full max-w-[864px] max-h-[90vh] bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 flex flex-col overflow-hidden relative">
        {/* Top Header / Breadcrumb Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
            <span className="font-bold text-sm" style={{ color: currentProject?.color || '#1F91EB' }}>
              #
            </span>
            <span className="hover:underline cursor-pointer font-medium text-xs">
              {currentProject?.name || 'Inbox'}
            </span>
          </div>

          {/* Action Buttons: Navigate Chevrons, More Menu, Close */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => onNavigateTask && onNavigateTask('prev')}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              title="Previous task"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTask && onNavigateTask('next')}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
              title="Next task"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Three Dots More Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
                title="More actions"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-[#252525] border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-[11px] text-gray-400 font-medium">
                    Added {format(new Date(task.created_at || Date.now()), 'd MMM · HH:mm')}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('Task link copied to clipboard');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copy link to task</span>
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    <Printer className="w-3.5 h-3.5 text-gray-400" />
                    <span>Print</span>
                  </button>
                  <button
                    onClick={() => {
                      showToast('Showing task activity');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
                  >
                    <History className="w-3.5 h-3.5 text-gray-400" />
                    <span>View task activity</span>
                  </button>
                  <div className="my-1 border-t border-gray-100 dark:border-neutral-800" />
                  <button
                    onClick={() => {
                      onDelete(task.id);
                      setIsMoreMenuOpen(false);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left 65% Main Content & Right 35% Meta Panel */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-y-auto">
          {/* Main Left Section (65%) */}
          <div className="md:col-span-8 p-6 space-y-6 border-r border-gray-100 dark:border-neutral-800">
            {/* Task Completion Check & Title */}
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onCompleteTask(task.id)}
                className="mt-1 w-5 h-5 rounded-full border-2 border-gray-400 hover:border-[#1F91EB] flex items-center justify-center transition-colors group cursor-pointer shrink-0"
              >
                {task.completed_at ? (
                  <Check className="w-3.5 h-3.5 text-[#1F91EB]" />
                ) : (
                  <Check className="w-3.5 h-3.5 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={() => handleSaveField({ content })}
                  className="w-full text-xl font-bold text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none"
                  placeholder="Task title"
                />

                {/* Description in-place */}
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleSaveField({ description })}
                  placeholder="Description"
                  rows={2}
                  className="w-full text-xs text-gray-600 dark:text-gray-400 bg-transparent focus:outline-none resize-none placeholder-gray-400 pt-1 leading-relaxed"
                />
              </div>
            </div>

            {/* Sub-tasks Section */}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => setIsSubtasksOpen(!isSubtasksOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 cursor-pointer"
              >
                <ChevronDown
                  className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', {
                    '-rotate-90': !isSubtasksOpen,
                  })}
                />
                <span>Sub-tasks</span>
                <span className="text-gray-400 font-normal">
                  {completedSubtasksCount}/{totalSubtasksCount}
                </span>
              </button>

              {isSubtasksOpen && (
                <div className="pl-5 space-y-2">
                  {task.subtasks?.map((st) => (
                    <div
                      key={st.id}
                      className="flex items-center gap-2.5 py-1 px-1 rounded-md hover:bg-gray-50 dark:hover:bg-neutral-800/60 group"
                    >
                      <button
                        type="button"
                        onClick={() => onCompleteTask(st.id)}
                        className="w-4 h-4 rounded-full border border-gray-400 hover:border-[#1F91EB] flex items-center justify-center cursor-pointer shrink-0"
                      >
                        {st.completed_at && <Check className="w-2.5 h-2.5 text-[#1F91EB]" />}
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

                  {/* Add Sub-task trigger or input */}
                  {isAddingSubtask ? (
                    <form onSubmit={handleAddSubtaskSubmit} className="pt-1 flex items-center gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        placeholder="Add sub-task..."
                        className="flex-1 text-xs px-2.5 py-1.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-md focus:outline-none focus:border-[#1F91EB]"
                      />
                      <button
                        type="submit"
                        disabled={!newSubtask.trim()}
                        className="px-3 py-1.5 bg-[#1F91EB] text-white text-xs font-medium rounded-md hover:bg-[#5BADEE] disabled:opacity-50 cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAddingSubtask(false)}
                        className="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsAddingSubtask(true)}
                      className="flex items-center gap-1.5 text-xs text-[#1F91EB] hover:text-[#5BADEE] font-medium pt-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add sub-task</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Comments Stream Section */}
            <div className="pt-2 border-t border-gray-100 dark:border-neutral-800/80">
              <button
                type="button"
                onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 hover:text-gray-900 cursor-pointer"
              >
                <ChevronDown
                  className={clsx('w-3.5 h-3.5 text-gray-400 transition-transform', {
                    '-rotate-90': !isCommentsOpen,
                  })}
                />
                <span>Comments</span>
                <span className="text-gray-400 font-normal">{comments.length}</span>
              </button>

              {isCommentsOpen && (
                <div className="space-y-4 mb-4">
                  {comments.map((c) => (
                    <div key={c.id} className="flex items-start gap-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#1F91EB] to-[#5BADEE] text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                        {c.author.slice(0, 1)}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{c.author}</span>
                          <span className="text-gray-400 text-[11px]">{c.time}</span>
                        </div>
                        <p className="text-gray-800 dark:text-gray-200">{c.text}</p>

                        {/* Audio memo player */}
                        {c.hasAudio && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-neutral-800 rounded-lg w-fit text-[11px] text-gray-700 dark:text-gray-300">
                            <button
                              type="button"
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="p-1 text-[#1F91EB] hover:text-[#5BADEE]"
                            >
                              {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            </button>
                            <span className="font-mono">00:00 • 00:03</span>
                          </div>
                        )}

                        {/* Reaction Pill */}
                        {c.reactions && (
                          <div className="flex items-center gap-1">
                            {c.reactions.map((r, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-[11px]"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Comment Input Box matching Mobbin media_0 & media_2 */}
                  <form
                    onSubmit={handleAddComment}
                    className="p-3 border border-gray-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-[#252525] space-y-3"
                  >
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Comment"
                      rows={2}
                      className="w-full text-xs text-gray-800 dark:text-gray-200 bg-transparent focus:outline-none resize-none placeholder-gray-400"
                    />

                    {/* Toolbar & Action Buttons */}
                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-neutral-800">
                      <div className="flex items-center gap-2 text-gray-400">
                        <button
                          type="button"
                          className="hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                          title="Attach file"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRecordingVoice(!isRecordingVoice);
                            showToast(
                              isRecordingVoice
                                ? 'Voice note cancelled'
                                : 'Recording voice note (Pro Ramble session)...'
                            );
                          }}
                          className={clsx('cursor-pointer p-1 transition-colors', {
                            'text-red-500 animate-pulse': isRecordingVoice,
                            'hover:text-gray-600 dark:hover:text-gray-200': !isRecordingVoice,
                          })}
                          title="Record voice note"
                        >
                          <Mic className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                          title="Add emoji"
                        >
                          <Smile className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          className="hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1"
                          title="Integrations & Extensions"
                        >
                          <Boxes className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setNewComment('');
                            setIsRecordingVoice(false);
                          }}
                          className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!newComment.trim() && !isRecordingVoice}
                          className="px-3.5 py-1.5 bg-[#1F91EB] hover:bg-[#5BADEE] text-white text-xs font-semibold rounded-lg disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

          {/* Right Meta Panel (35%) matching Mobbin media_0 & media_13 */}
          <div className="md:col-span-4 p-5 bg-[#fafafa] dark:bg-[#1a1a1a] space-y-4 text-xs text-gray-700 dark:text-gray-300">
            {/* Project Picker */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Project</label>
              <div className="flex items-center gap-1.5 py-1">
                <span className="font-bold" style={{ color: currentProject?.color || '#1F91EB' }}>
                  #
                </span>
                <select
                  value={projectId}
                  onChange={(e) => {
                    setProjectId(e.target.value);
                    handleSaveField({ projectId: e.target.value });
                    showToast('Project updated');
                  }}
                  className="bg-transparent font-medium text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer w-full"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Assignee</label>
              <div className="flex items-center justify-between py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -mx-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#1F91EB] text-white flex items-center justify-center text-[10px] font-bold">
                    S
                  </div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">Samlee</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Due Date & Popover */}
            <div className="relative">
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Date</label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                className="w-full flex items-center justify-between py-1 text-left hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -mx-1 cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>
                    {dueDate
                      ? `${format(new Date(dueDate), 'd MMM')} ${dueTime || ''} ${recurrence ? '🔁' : ''}`
                      : 'Today'}
                  </span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </button>

              {isDatePickerOpen && (
                <DatePickerPopover
                  initialDate={dueDate}
                  initialTime={dueTime}
                  initialRecurrence={recurrence}
                  onSelect={(data) => {
                    setDueDate(data.dueDate);
                    if (data.dueTime) setDueTime(data.dueTime);
                    if (data.recurrence) setRecurrence(data.recurrence);
                    handleSaveField({
                      dueDate: data.dueDate,
                      dueAt: data.dueTime && data.dueDate ? `${data.dueDate}T${data.dueTime}:00` : null,
                      recurrence: data.recurrence,
                    });
                    showToast(
                      data.dueDate
                        ? `Date updated to ${format(new Date(data.dueDate), 'd MMM')} ${data.dueTime || ''}`
                        : 'Date removed'
                    );
                    setIsDatePickerOpen(false);
                  }}
                  onClose={() => setIsDatePickerOpen(false)}
                />
              )}
            </div>

            {/* Hard Deadline */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Deadline</label>
              <div className="flex items-center justify-between py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -mx-1 cursor-pointer">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{deadline ? format(new Date(deadline), 'd MMM') : 'Add deadline'}</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Priority Picker */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Priority</label>
              <div className="flex items-center gap-1.5 py-1">
                <Flag className={clsx('w-3.5 h-3.5', priorityMeta[priority].flagColor)} />
                <select
                  value={priority}
                  onChange={(e) => {
                    const p = Number(e.target.value) as Priority;
                    setPriority(p);
                    handleSaveField({ priority: p });
                    showToast(`Priority updated to P${p}`);
                  }}
                  className="bg-transparent font-medium text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer w-full"
                >
                  <option value={1}>P1 (Red)</option>
                  <option value={2}>P2 (Orange)</option>
                  <option value={3}>P3 (Blue)</option>
                  <option value={4}>P4 (Grey)</option>
                </select>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Labels</label>
              <div className="flex items-center justify-between py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -mx-1 cursor-pointer">
                <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <Tag className="w-3.5 h-3.5 text-gray-400" />
                  <span>Add label</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Reminders (Pro feature unlocked) */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Reminders</label>
              <div className="flex items-center justify-between py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -mx-1 cursor-pointer">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <Bell className="w-3.5 h-3.5 text-gray-400" />
                  <span>30 mins before</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>

            {/* Location Reminder */}
            <div>
              <label className="block text-gray-400 font-medium text-[11px] mb-1">Location</label>
              <div className="flex items-center justify-between py-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded px-1 -mx-1 cursor-pointer">
                <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="truncate max-w-[150px]">Arriving: Menlo Park, CA</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Toast Notification (matching Mobbin media_12.webp) */}
        {toastMessage && (
          <div className="absolute bottom-4 left-6 bg-[#252525] text-white text-xs px-4 py-2.5 rounded-lg shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150 z-50">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToMessage(null)}
              className="font-medium text-[#5BADEE] hover:underline"
            >
              Undo
            </button>
            <button
              type="button"
              onClick={() => setToMessage(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

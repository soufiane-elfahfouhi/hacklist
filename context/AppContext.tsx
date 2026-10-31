'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, Project, Section, Priority, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

interface AppContextType {
  projects: Project[];
  tasks: Task[];
  sections: Section[];
  profile: Profile | null;
  selectedTask: Task | null;
  isQuickAddOpen: boolean;
  counts: { inbox: number; today: number; upcoming: number };
  setSelectedTask: (task: Task | null) => void;
  setIsQuickAddOpen: (open: boolean) => void;
  createTask: (params: {
    content: string;
    description?: string;
    priority?: Priority;
    projectId?: string;
    sectionId?: string | null;
    dueDate?: string | null;
    deadline?: string | null;
    recurrence?: string | null;
  }) => Promise<void>;
  updateTask: (taskId: string, updates: any) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  createProject: (name: string, color?: string) => Promise<void>;
  createSection: (projectId: string, name: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STATIC_TIME = '2026-10-31T00:00:00.000Z';
const STATIC_DATE = '2026-10-31';

const DEFAULT_INBOX: Project = {
  id: 'inbox-default-id',
  user_id: 'local-user',
  name: 'Inbox',
  color: '#1F91EB',
  view_style: 'list',
  is_inbox: true,
  is_favorite: false,
  child_order: 0,
  created_at: STATIC_TIME,
  updated_at: STATIC_TIME,
};

const DEFAULT_PROJECT_WORK: Project = {
  id: 'proj-work-id',
  user_id: 'local-user',
  name: 'Work',
  color: '#5BADEE',
  view_style: 'list',
  is_inbox: false,
  is_favorite: true,
  child_order: 1,
  created_at: STATIC_TIME,
  updated_at: STATIC_TIME,
};

const INITIAL_TASKS: Task[] = [
  {
    id: 't-1',
    user_id: 'local-user',
    project_id: 'inbox-default-id',
    content: 'Welcome to Hacklist! 🚀',
    description: 'Precision Todoist-style productivity built for you and connected to Antigravity.',
    priority: 1,
    due_date: STATIC_DATE,
    duration_min: 30,
    child_order: 0,
    created_at: STATIC_TIME,
    updated_at: STATIC_TIME,
  },
  {
    id: 't-2',
    user_id: 'local-user',
    project_id: 'proj-work-id',
    content: 'Connect Antigravity MCP Server',
    description: 'Go to Settings > Integrations and copy your MCP snippet into ~/.gemini/config/mcp_config.json',
    priority: 2,
    due_date: STATIC_DATE,
    duration_min: 45,
    child_order: 1,
    created_at: STATIC_TIME,
    updated_at: STATIC_TIME,
  },
  {
    id: 't-3',
    user_id: 'local-user',
    project_id: 'proj-work-id',
    content: 'Explore Board (Kanban) and Calendar time-blocking views',
    description: 'Open any project to switch between List, Board, and Calendar layout.',
    priority: 3,
    duration_min: 30,
    child_order: 2,
    created_at: STATIC_TIME,
    updated_at: STATIC_TIME,
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([DEFAULT_INBOX, DEFAULT_PROJECT_WORK]);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [sections, setSections] = useState<Section[]>([]);
  const [profile, setProfile] = useState<Profile | null>({
    id: 'local-user',
    email: 'user@hacklist.dev',
    full_name: 'Hacklist Developer',
    daily_goal: 5,
    weekly_goal: 25,
    karma: 350,
    created_at: STATIC_TIME,
  });
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [todayStr, setTodayStr] = useState<string>(STATIC_DATE);

  useEffect(() => {
    setTodayStr(new Date().toISOString().split('T')[0]);
  }, []);

  // Compute counts
  const activeTasks = tasks.filter((t) => !t.completed_at);
  const inboxCount = activeTasks.filter(
    (t) => t.project_id === projects.find((p) => p.is_inbox)?.id
  ).length;
  const todayCount = activeTasks.filter(
    (t) => t.due_date === todayStr || (t.due_at && t.due_at.startsWith(todayStr))
  ).length;
  const upcomingCount = activeTasks.filter(
    (t) => (t.due_date && t.due_date >= todayStr) || (t.due_at && t.due_at >= todayStr)
  ).length;

  const refreshData = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: pList } = await supabase.from('projects').select('*').eq('user_id', user.id);
        if (pList && pList.length > 0) setProjects(pList);

        const { data: tList } = await supabase.from('tasks').select('*').eq('user_id', user.id);
        if (tList) setTasks(tList);

        const { data: sList } = await supabase.from('sections').select('*').eq('user_id', user.id);
        if (sList) setSections(sList);
      }
    } catch {
      // Local preview mode
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const createTask = async (params: {
    content: string;
    description?: string;
    priority?: Priority;
    projectId?: string;
    sectionId?: string | null;
    dueDate?: string | null;
    deadline?: string | null;
    recurrence?: string | null;
  }) => {
    const targetProjectId =
      params.projectId || projects.find((p) => p.is_inbox)?.id || projects[0]?.id || 'inbox';

    const nowIso = new Date().toISOString();
    const newTask: Task = {
      id: 'task-' + Date.now(),
      user_id: profile?.id || 'local-user',
      project_id: targetProjectId,
      section_id: params.sectionId || null,
      content: params.content,
      description: params.description || '',
      priority: params.priority || 4,
      due_date: params.dueDate || null,
      deadline: params.deadline || null,
      recurrence: params.recurrence || null,
      duration_min: 30,
      child_order: tasks.length,
      created_at: nowIso,
      updated_at: nowIso,
    };

    setTasks((prev) => [newTask, ...prev]);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('tasks').insert({
          ...newTask,
          user_id: user.id,
        });
      }
    } catch {
      // Local fallback
    }
  };

  const updateTask = async (taskId: string, updates: any) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...updates, updated_at: new Date().toISOString() } : t))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, ...updates } : null));
    }
  };

  const completeTask = async (taskId: string) => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              completed_at: t.completed_at ? null : nowIso,
              updated_at: nowIso,
            }
          : t
      )
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) =>
        prev
          ? {
              ...prev,
              completed_at: prev.completed_at ? null : nowIso,
            }
          : null
      );
    }
  };

  const deleteTask = async (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTask?.id === taskId) {
      setSelectedTask(null);
    }
  };

  const createProject = async (name: string, color: string = '#1F91EB') => {
    const nowIso = new Date().toISOString();
    const newProj: Project = {
      id: 'proj-' + Date.now(),
      user_id: profile?.id || 'local-user',
      name,
      color,
      view_style: 'list',
      is_inbox: false,
      is_favorite: false,
      child_order: projects.length,
      created_at: nowIso,
      updated_at: nowIso,
    };
    setProjects((prev) => [...prev, newProj]);
  };

  const createSection = async (projectId: string, name: string) => {
    const newSec: Section = {
      id: 'sec-' + Date.now(),
      user_id: profile?.id || 'local-user',
      project_id: projectId,
      name,
      child_order: sections.length,
      created_at: new Date().toISOString(),
    };
    setSections((prev) => [...prev, newSec]);
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        tasks,
        sections,
        profile,
        selectedTask,
        isQuickAddOpen,
        counts: { inbox: inboxCount, today: todayCount, upcoming: upcomingCount },
        setSelectedTask,
        setIsQuickAddOpen,
        createTask,
        updateTask,
        completeTask,
        deleteTask,
        createProject,
        createSection,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}

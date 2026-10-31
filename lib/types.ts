// Hacklist Domain Types

export type Priority = 1 | 2 | 3 | 4;

export type ViewStyle = 'list' | 'board' | 'calendar';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  daily_goal: number;
  weekly_goal: number;
  karma: number;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  color: string;
  parent_id?: string | null;
  view_style: ViewStyle;
  is_inbox: boolean;
  is_favorite: boolean;
  child_order: number;
  archived_at?: string | null;
  created_at: string;
  updated_at: string;
  // Computed / client counts
  task_count?: number;
}

export interface Section {
  id: string;
  user_id: string;
  project_id: string;
  name: string;
  child_order: number;
  archived_at?: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id: string;
  section_id?: string | null;
  parent_id?: string | null;
  content: string;
  description: string;
  priority: Priority;
  due_date?: string | null; // 'YYYY-MM-DD'
  due_at?: string | null;   // ISO timestamp
  duration_min: number;
  recurrence?: string | null; // RFC 5545 RRULE
  deadline?: string | null;   // 'YYYY-MM-DD'
  child_order: number;
  completed_at?: string | null;
  gcal_event_id?: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  labels?: Label[];
  subtasks?: Task[];
  comments_count?: number;
}

export interface Label {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_favorite: boolean;
  created_at: string;
}

export interface Comment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_avatar?: string;
}

export interface Reminder {
  id: string;
  task_id: string;
  user_id: string;
  type: 'absolute' | 'relative';
  remind_at?: string | null;
  minutes_before?: number | null;
  sent_at?: string | null;
  created_at: string;
}

export interface ActivityLogItem {
  id: string;
  user_id: string;
  event_type: 'added' | 'updated' | 'completed' | 'uncompleted' | 'deleted' | 'commented' | 'moved';
  object_type: 'task' | 'project' | 'section' | 'comment';
  object_id: string;
  object_title?: string;
  payload?: Record<string, unknown>;
  source: 'web' | 'mcp' | 'gcal' | 'api';
  created_at: string;
}

export interface ApiToken {
  id: string;
  user_id: string;
  name: string;
  last_used_at?: string | null;
  created_at: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isAllDay: boolean;
  isGCal: boolean;
  taskId?: string;
  priority?: Priority;
  color?: string;
}

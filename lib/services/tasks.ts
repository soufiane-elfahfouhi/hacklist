import { SupabaseClient } from '@supabase/supabase-js';
import { Task, Priority } from '@/lib/types';
import { logActivity } from './activity';
import { rrulestr } from 'rrule';

export async function getTasks(
  supabase: SupabaseClient,
  userId: string,
  filter?: {
    projectId?: string;
    sectionId?: string;
    completed?: boolean;
    dueFilter?: 'today' | 'upcoming' | 'overdue' | 'all';
  }
): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select(`
      *,
      task_labels (
        labels (*)
      )
    `)
    .eq('user_id', userId)
    .order('child_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (filter?.projectId) {
    query = query.eq('project_id', filter.projectId);
  }
  if (filter?.sectionId) {
    query = query.eq('section_id', filter.sectionId);
  }
  if (filter?.completed !== undefined) {
    if (filter.completed) {
      query = query.not('completed_at', 'is', null);
    } else {
      query = query.is('completed_at', null);
    }
  }

  const { data, error } = await query;
  if (error) throw error;

  let tasks: Task[] = (data || []).map((row: any) => ({
    ...row,
    labels: row.task_labels?.map((tl: any) => tl.labels).filter(Boolean) || [],
  }));

  const todayStr = new Date().toISOString().split('T')[0];

  if (filter?.dueFilter === 'today') {
    tasks = tasks.filter(t => t.due_date === todayStr || (t.due_at && t.due_at.startsWith(todayStr)));
  } else if (filter?.dueFilter === 'overdue') {
    tasks = tasks.filter(t => {
      if (t.completed_at) return false;
      const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
      return d && d < todayStr;
    });
  } else if (filter?.dueFilter === 'upcoming') {
    tasks = tasks.filter(t => {
      const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
      return d && d >= todayStr;
    });
  }

  return tasks;
}

export async function getTaskById(
  supabase: SupabaseClient,
  userId: string,
  taskId: string
): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select(`
      *,
      task_labels (
        labels (*)
      ),
      subtasks:tasks!parent_id (*)
    `)
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;

  return {
    ...data,
    labels: data.task_labels?.map((tl: any) => tl.labels).filter(Boolean) || [],
    subtasks: data.subtasks || [],
  };
}

export async function createTask(
  supabase: SupabaseClient,
  userId: string,
  params: {
    projectId: string;
    content: string;
    description?: string;
    priority?: Priority;
    sectionId?: string | null;
    parentId?: string | null;
    dueDate?: string | null;
    dueAt?: string | null;
    durationMin?: number;
    recurrence?: string | null;
    deadline?: string | null;
    labelIds?: string[];
    source?: 'web' | 'mcp' | 'gcal' | 'api';
  }
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      project_id: params.projectId,
      content: params.content,
      description: params.description || '',
      priority: params.priority || 4,
      section_id: params.sectionId || null,
      parent_id: params.parentId || null,
      due_date: params.dueDate || null,
      due_at: params.dueAt || null,
      duration_min: params.durationMin || 30,
      recurrence: params.recurrence || null,
      deadline: params.deadline || null,
    })
    .select()
    .single();

  if (error) throw error;

  // Add labels if provided
  if (params.labelIds && params.labelIds.length > 0) {
    const records = params.labelIds.map(labelId => ({
      task_id: data.id,
      label_id: labelId,
    }));
    await supabase.from('task_labels').insert(records);
  }

  await logActivity(supabase, userId, {
    eventType: 'added',
    objectType: 'task',
    objectId: data.id,
    objectTitle: data.content,
    source: params.source || 'web',
  });

  return data;
}

export async function updateTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  updates: Partial<{
    content: string;
    description: string;
    priority: Priority;
    projectId: string;
    sectionId: string | null;
    parentId: string | null;
    dueDate: string | null;
    dueAt: string | null;
    durationMin: number;
    recurrence: string | null;
    deadline: string | null;
    childOrder: number;
  }>,
  source: 'web' | 'mcp' | 'gcal' | 'api' = 'web'
): Promise<Task> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.priority !== undefined) payload.priority = updates.priority;
  if (updates.projectId !== undefined) payload.project_id = updates.projectId;
  if (updates.sectionId !== undefined) payload.section_id = updates.sectionId;
  if (updates.parentId !== undefined) payload.parent_id = updates.parentId;
  if (updates.dueDate !== undefined) payload.due_date = updates.dueDate;
  if (updates.dueAt !== undefined) payload.due_at = updates.dueAt;
  if (updates.durationMin !== undefined) payload.duration_min = updates.durationMin;
  if (updates.recurrence !== undefined) payload.recurrence = updates.recurrence;
  if (updates.deadline !== undefined) payload.deadline = updates.deadline;
  if (updates.childOrder !== undefined) payload.child_order = updates.childOrder;

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', taskId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(supabase, userId, {
    eventType: 'updated',
    objectType: 'task',
    objectId: taskId,
    objectTitle: data.content,
    source,
  });

  return data;
}

export async function completeTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  source: 'web' | 'mcp' | 'gcal' | 'api' = 'web'
): Promise<{ completed: boolean; nextDueDate?: string | null }> {
  // Fetch existing task to check for recurrence
  const task = await getTaskById(supabase, userId, taskId);
  if (!task) throw new Error('Task not found');

  if (task.recurrence) {
    try {
      const rule = rrulestr(task.recurrence, {
        dtstart: task.due_at ? new Date(task.due_at) : (task.due_date ? new Date(task.due_date) : new Date())
      });
      const nextDate = rule.after(new Date());

      if (nextDate) {
        const nextDateStr = nextDate.toISOString().split('T')[0];
        const nextTimeStr = task.due_at ? nextDate.toISOString() : null;

        await supabase
          .from('tasks')
          .update({
            due_date: nextDateStr,
            due_at: nextTimeStr,
            updated_at: new Date().toISOString(),
          })
          .eq('id', taskId)
          .eq('user_id', userId);

        await logActivity(supabase, userId, {
          eventType: 'completed',
          objectType: 'task',
          objectId: taskId,
          objectTitle: task.content,
          payload: { rolledOverTo: nextDateStr },
          source,
        });

        return { completed: false, nextDueDate: nextDateStr };
      }
    } catch (e) {
      console.warn('Failed to parse recurrence rule, completing standard task:', e);
    }
  }

  // Standard non-recurring task completion
  const now = new Date().toISOString();
  await supabase
    .from('tasks')
    .update({ completed_at: now, updated_at: now })
    .eq('id', taskId)
    .eq('user_id', userId);

  await logActivity(supabase, userId, {
    eventType: 'completed',
    objectType: 'task',
    objectId: taskId,
    objectTitle: task.content,
    source,
  });

  return { completed: true };
}

export async function uncompleteTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  source: 'web' | 'mcp' | 'gcal' | 'api' = 'web'
): Promise<void> {
  const task = await getTaskById(supabase, userId, taskId);
  if (!task) throw new Error('Task not found');

  await supabase
    .from('tasks')
    .update({ completed_at: null, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .eq('user_id', userId);

  await logActivity(supabase, userId, {
    eventType: 'uncompleted',
    objectType: 'task',
    objectId: taskId,
    objectTitle: task.content,
    source,
  });
}

export async function deleteTask(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  source: 'web' | 'mcp' | 'gcal' | 'api' = 'web'
): Promise<void> {
  const task = await getTaskById(supabase, userId, taskId);
  if (!task) return;

  await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId)
    .eq('user_id', userId);

  await logActivity(supabase, userId, {
    eventType: 'deleted',
    objectType: 'task',
    objectId: taskId,
    objectTitle: task.content,
    source,
  });
}

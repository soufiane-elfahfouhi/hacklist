import { SupabaseClient } from '@supabase/supabase-js';
import { Project, ViewStyle } from '@/lib/types';
import { logActivity } from './activity';

export async function getProjects(
  supabase: SupabaseClient,
  userId: string
): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('child_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getProjectById(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

export async function createProject(
  supabase: SupabaseClient,
  userId: string,
  params: {
    name: string;
    color?: string;
    viewStyle?: ViewStyle;
    isFavorite?: boolean;
    parentId?: string | null;
    source?: 'web' | 'mcp' | 'api';
  }
): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      user_id: userId,
      name: params.name,
      color: params.color || '#1F91EB',
      view_style: params.viewStyle || 'list',
      is_favorite: params.isFavorite || false,
      parent_id: params.parentId || null,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity(supabase, userId, {
    eventType: 'added',
    objectType: 'project',
    objectId: data.id,
    objectTitle: data.name,
    source: params.source || 'web',
  });

  return data;
}

export async function updateProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  updates: Partial<{
    name: string;
    color: string;
    viewStyle: ViewStyle;
    isFavorite: boolean;
    parentId: string | null;
  }>,
  source: 'web' | 'mcp' | 'api' = 'web'
): Promise<Project> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.color !== undefined) payload.color = updates.color;
  if (updates.viewStyle !== undefined) payload.view_style = updates.viewStyle;
  if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;
  if (updates.parentId !== undefined) payload.parent_id = updates.parentId;

  const { data, error } = await supabase
    .from('projects')
    .update(payload)
    .eq('id', projectId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  await logActivity(supabase, userId, {
    eventType: 'updated',
    objectType: 'project',
    objectId: projectId,
    objectTitle: data.name,
    source,
  });

  return data;
}

export async function archiveProject(
  supabase: SupabaseClient,
  userId: string,
  projectId: string,
  source: 'web' | 'mcp' | 'api' = 'web'
): Promise<void> {
  const project = await getProjectById(supabase, userId, projectId);
  if (!project || project.is_inbox) return; // Prevent archiving inbox

  await supabase
    .from('projects')
    .update({ archived_at: new Date().toISOString() })
    .eq('id', projectId)
    .eq('user_id', userId);

  await logActivity(supabase, userId, {
    eventType: 'deleted',
    objectType: 'project',
    objectId: projectId,
    objectTitle: project.name,
    source,
  });
}

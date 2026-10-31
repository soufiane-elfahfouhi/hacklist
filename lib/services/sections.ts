import { SupabaseClient } from '@supabase/supabase-js';
import { Section } from '@/lib/types';
import { logActivity } from './activity';

export async function getSections(
  supabase: SupabaseClient,
  userId: string,
  projectId: string
): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .is('archived_at', null)
    .order('child_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSection(
  supabase: SupabaseClient,
  userId: string,
  params: {
    projectId: string;
    name: string;
    source?: 'web' | 'mcp' | 'api';
  }
): Promise<Section> {
  const { data, error } = await supabase
    .from('sections')
    .insert({
      user_id: userId,
      project_id: params.projectId,
      name: params.name,
    })
    .select()
    .single();

  if (error) throw error;

  await logActivity(supabase, userId, {
    eventType: 'added',
    objectType: 'section',
    objectId: data.id,
    objectTitle: data.name,
    source: params.source || 'web',
  });

  return data;
}

export async function deleteSection(
  supabase: SupabaseClient,
  userId: string,
  sectionId: string,
  source: 'web' | 'mcp' | 'api' = 'web'
): Promise<void> {
  await supabase
    .from('sections')
    .delete()
    .eq('id', sectionId)
    .eq('user_id', userId);

  await logActivity(supabase, userId, {
    eventType: 'deleted',
    objectType: 'section',
    objectId: sectionId,
    source,
  });
}

import { SupabaseClient } from '@supabase/supabase-js';

export async function logActivity(
  supabase: SupabaseClient,
  userId: string,
  event: {
    eventType: 'added' | 'updated' | 'completed' | 'uncompleted' | 'deleted' | 'commented' | 'moved';
    objectType: 'task' | 'project' | 'section' | 'comment';
    objectId: string;
    objectTitle?: string;
    payload?: Record<string, unknown>;
    source?: 'web' | 'mcp' | 'gcal' | 'api';
  }
) {
  try {
    await supabase.from('activity_log').insert({
      user_id: userId,
      event_type: event.eventType,
      object_type: event.objectType,
      object_id: event.objectId,
      object_title: event.objectTitle || '',
      payload: event.payload || {},
      source: event.source || 'web',
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

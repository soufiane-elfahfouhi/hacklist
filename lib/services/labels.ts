import { SupabaseClient } from '@supabase/supabase-js';
import { Label } from '@/lib/types';

export async function getLabels(
  supabase: SupabaseClient,
  userId: string
): Promise<Label[]> {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createLabel(
  supabase: SupabaseClient,
  userId: string,
  name: string,
  color: string = '#5BADEE'
): Promise<Label> {
  const { data, error } = await supabase
    .from('labels')
    .insert({
      user_id: userId,
      name,
      color,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLabel(
  supabase: SupabaseClient,
  userId: string,
  labelId: string
): Promise<void> {
  await supabase
    .from('labels')
    .delete()
    .eq('id', labelId)
    .eq('user_id', userId);
}

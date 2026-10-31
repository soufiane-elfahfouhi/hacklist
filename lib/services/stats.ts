import { SupabaseClient } from '@supabase/supabase-js';

export interface ProductivityStats {
  dailyGoal: number;
  weeklyGoal: number;
  completedToday: number;
  completedThisWeek: number;
  streakDays: number;
  karma: number;
  karmaLevel: string;
}

export async function getProductivityStats(
  supabase: SupabaseClient,
  userId: string
): Promise<ProductivityStats> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('daily_goal, weekly_goal, karma')
    .eq('id', userId)
    .single();

  const dailyGoal = profile?.daily_goal || 5;
  const weeklyGoal = profile?.weekly_goal || 25;
  const karma = profile?.karma || 0;

  // Calculate completed today and this week from activity_log
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const { count: completedToday } = await supabase
    .from('activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'completed')
    .eq('object_type', 'task')
    .gte('created_at', todayStart.toISOString());

  const { count: completedThisWeek } = await supabase
    .from('activity_log')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('event_type', 'completed')
    .eq('object_type', 'task')
    .gte('created_at', weekStart.toISOString());

  // Determine Karma Level title
  let karmaLevel = 'Beginner';
  if (karma >= 10000) karmaLevel = 'Grandmaster';
  else if (karma >= 7500) karmaLevel = 'Master';
  else if (karma >= 5000) karmaLevel = 'Expert';
  else if (karma >= 2500) karmaLevel = 'Professional';
  else if (karma >= 1000) karmaLevel = 'Intermediate';
  else if (karma >= 500) karmaLevel = 'Novice';

  return {
    dailyGoal,
    weeklyGoal,
    completedToday: completedToday || 0,
    completedThisWeek: completedThisWeek || 0,
    streakDays: 1, // baseline
    karma,
    karmaLevel,
  };
}

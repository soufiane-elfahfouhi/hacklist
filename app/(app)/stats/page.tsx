'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { StatsView } from '@/components/StatsView';

export default function GlobalStatsPage() {
  const { profile, tasks } = useApp();

  const completedCount = tasks.filter((t) => !!t.completed_at).length;

  return (
    <StatsView
      stats={{
        dailyGoal: profile?.daily_goal || 5,
        weeklyGoal: profile?.weekly_goal || 25,
        completedToday: completedCount,
        completedThisWeek: completedCount,
        streakDays: 3,
        karma: profile?.karma || 420,
        karmaLevel: 'Expert',
      }}
    />
  );
}

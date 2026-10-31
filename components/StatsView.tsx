'use client';

import React from 'react';
import { ProductivityStats } from '@/lib/services/stats';
import { Sparkles, Target, Zap, Trophy, TrendingUp } from 'lucide-react';

interface StatsViewProps {
  stats: ProductivityStats;
}

export function StatsView({ stats }: StatsViewProps) {
  const dailyPercent = Math.min(100, Math.round((stats.completedToday / (stats.dailyGoal || 1)) * 100));
  const weeklyPercent = Math.min(100, Math.round((stats.completedThisWeek / (stats.weeklyGoal || 1)) * 100));

  return (
    <div className="max-w-[800px] mx-auto p-6 space-y-6 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#1F91EB]" />
            <span>Productivity & Karma</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Track daily momentum, streaks, and build your Karma standing.
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-[#1F91EB]">{stats.karma}</span>
          <span className="text-xs text-gray-400 block font-semibold uppercase tracking-wider">Karma Points</span>
        </div>
      </div>

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Karma Level Card */}
        <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#1F91EB]/15 text-[#1F91EB] flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Karma Standing</div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100">{stats.karmaLevel}</div>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Current Streak</div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100">
              {stats.streakDays} {stats.streakDays === 1 ? 'day' : 'days'}
            </div>
          </div>
        </div>

        {/* Completed This Week */}
        <div className="p-4 bg-gray-50 dark:bg-neutral-900 rounded-xl border border-gray-200 dark:border-neutral-800 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">Completed This Week</div>
            <div className="text-base font-bold text-gray-900 dark:text-gray-100">
              {stats.completedThisWeek} tasks
            </div>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Daily Goal */}
        <div className="p-5 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-[#1F91EB]" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Daily Goal</span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {stats.completedToday} / {stats.dailyGoal} completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1F91EB] rounded-full transition-all duration-300"
              style={{ width: `${dailyPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {stats.completedToday >= stats.dailyGoal
              ? '🎉 Daily goal achieved! Keep the momentum going.'
              : `${stats.dailyGoal - stats.completedToday} more tasks to reach your daily goal.`}
          </p>
        </div>

        {/* Weekly Goal */}
        <div className="p-5 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-gray-100">Weekly Goal</span>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {stats.completedThisWeek} / {stats.weeklyGoal} completed
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-purple-500 rounded-full transition-all duration-300"
              style={{ width: `${weeklyPercent}%` }}
            />
          </div>
          <p className="text-[11px] text-gray-400">
            {stats.completedThisWeek >= stats.weeklyGoal
              ? '🏆 Weekly target reached! Fantastic work.'
              : `${stats.weeklyGoal - stats.completedThisWeek} more tasks to hit your weekly goal.`}
          </p>
        </div>
      </div>
    </div>
  );
}

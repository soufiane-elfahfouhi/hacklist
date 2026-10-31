'use client';

import React, { useState, useEffect } from 'react';
import { Task, CalendarEventItem } from '@/lib/types';
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay } from 'date-fns';
import clsx from 'clsx';

interface CalendarViewProps {
  tasks: Task[];
  externalEvents?: CalendarEventItem[];
  onSelectTask: (task: Task) => void;
  onTimeBlockTask: (taskId: string, dueAt: string, durationMin: number) => Promise<void>;
}

export function CalendarView({
  tasks,
  externalEvents = [],
  onSelectTask,
  onTimeBlockTask,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date('2026-10-31T00:00:00.000Z'));
  const [today, setToday] = useState<Date>(() => new Date('2026-10-31T00:00:00.000Z'));
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setToday(now);
  }, []);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7 AM to 10 PM (22:00)

  // Filter tasks that have timed due_at
  const timedTasks = tasks.filter((t) => t.due_at && !t.completed_at);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] p-4 select-none">
      {/* Calendar Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setCurrentDate(viewMode === 'week' ? subWeeks(currentDate, 1) : addDays(currentDate, -1))}
              className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={() => setCurrentDate(today)}
              className="px-2.5 py-0.5 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-all cursor-pointer"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentDate(viewMode === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))}
              className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-md transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg p-0.5 text-xs font-semibold">
          <button
            onClick={() => setViewMode('day')}
            className={clsx(
              'px-3 py-1 rounded-md transition-all cursor-pointer',
              viewMode === 'day'
                ? 'bg-white dark:bg-neutral-700 text-[#1F91EB] shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={clsx(
              'px-3 py-1 rounded-md transition-all cursor-pointer',
              viewMode === 'week'
                ? 'bg-white dark:bg-neutral-700 text-[#1F91EB] shadow-xs'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            Week
          </button>
        </div>
      </div>

      {/* Week Days Header */}
      <div className="grid grid-cols-8 border-b border-gray-200 dark:border-neutral-800 py-2 text-center text-xs">
        <div className="text-gray-400 font-medium">Time</div>
        {(viewMode === 'week' ? weekDays : [currentDate]).map((d) => {
          const isToday = isSameDay(d, today);
          return (
            <div
              key={d.toISOString()}
              className={clsx('flex-1 font-semibold', isToday ? 'text-[#1F91EB]' : 'text-gray-700 dark:text-gray-300')}
            >
              <div>{format(d, 'EEE')}</div>
              <div
                className={clsx(
                  'w-6 h-6 mx-auto rounded-full flex items-center justify-center mt-0.5 text-xs',
                  isToday && 'bg-[#1F91EB] text-white'
                )}
              >
                {format(d, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Grid */}
      <div className="flex-1 overflow-y-auto">
        {hours.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-8 min-h-[52px] border-b border-gray-100 dark:border-neutral-800/60"
          >
            {/* Hour Label */}
            <div className="text-[11px] text-gray-400 pr-2 pt-1 text-right font-mono">
              {hour}:00
            </div>

            {/* Day columns */}
            {(viewMode === 'week' ? weekDays : [currentDate]).map((d) => {
              const dayStr = format(d, 'yyyy-MM-dd');
              const slotTasks = timedTasks.filter((t) => {
                if (!t.due_at) return false;
                const taskDate = t.due_at.split('T')[0];
                const taskHour = new Date(t.due_at).getHours();
                return taskDate === dayStr && taskHour === hour;
              });

              return (
                <div
                  key={d.toISOString() + hour}
                  className="border-l border-gray-100 dark:border-neutral-800/60 p-1 hover:bg-gray-50/50 dark:hover:bg-neutral-900/30 transition-all relative group"
                >
                  {slotTasks.map((t) => (
                    <div
                      key={t.id}
                      onClick={() => onSelectTask(t)}
                      className="p-1.5 mb-1 bg-[#1F91EB]/15 border-l-3 border-[#1F91EB] rounded text-xs cursor-pointer hover:bg-[#1F91EB]/25 transition-all"
                    >
                      <div className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {t.content}
                      </div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5 text-[#1F91EB]" />
                        <span>{t.duration_min}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

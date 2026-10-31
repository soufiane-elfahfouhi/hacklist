'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/TaskItem';
import { CalendarDays } from 'lucide-react';
import { format, addDays } from 'date-fns';

export default function UpcomingPage() {
  const { tasks, projects, completeTask, setSelectedTask } = useApp();
  const [days, setDays] = useState<Date[]>([]);

  useEffect(() => {
    const now = new Date();
    setDays(Array.from({ length: 7 }, (_, i) => addDays(now, i)));
  }, []);

  return (
    <div className="max-w-[800px] mx-auto pt-10 pb-20 px-8">
      {/* Header */}
      <div className="flex items-baseline justify-between pb-6 border-b border-gray-100 dark:border-neutral-800 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2.5">
            <CalendarDays className="w-6 h-6 text-purple-500" />
            <span>Upcoming</span>
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            7-day forecast of scheduled tasks, deadlines, and time commitments.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const dayTasks = tasks.filter((t) => {
            if (t.completed_at) return false;
            const d = t.due_date || (t.due_at ? t.due_at.split('T')[0] : null);
            return d === dateStr;
          });

          return (
            <div key={dateStr} className="space-y-2">
              <div className="flex items-baseline gap-2 pb-1 border-b border-gray-200 dark:border-neutral-800">
                <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  {idx === 0 ? 'Today' : idx === 1 ? 'Tomorrow' : format(day, 'EEEE')}
                </span>
                <span className="text-xs text-gray-400 font-medium">
                  {format(day, 'MMM d')}
                </span>
              </div>

              <div className="space-y-0.5">
                {dayTasks.length === 0 ? (
                  <div className="text-xs text-gray-400 py-1.5 px-2">No tasks scheduled</div>
                ) : (
                  dayTasks.map((t) => {
                    const proj = projects.find((p) => p.id === t.project_id);
                    return (
                      <TaskItem
                        key={t.id}
                        task={t}
                        projectName={proj?.name}
                        projectColor={proj?.color}
                        onComplete={completeTask}
                        onClick={setSelectedTask}
                      />
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

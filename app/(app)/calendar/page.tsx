'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CalendarView } from '@/components/CalendarView';

export default function GlobalCalendarPage() {
  const { tasks, setSelectedTask, updateTask } = useApp();

  return (
    <div className="h-full">
      <CalendarView
        tasks={tasks}
        onSelectTask={setSelectedTask}
        onTimeBlockTask={async (taskId, dueAt, durationMin) => {
          await updateTask(taskId, { dueAt, durationMin });
        }}
      />
    </div>
  );
}

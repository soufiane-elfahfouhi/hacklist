'use client';

import React, { useState } from 'react';
import {
  format,
  addDays,
  nextMonday,
  nextFriday,
  nextSaturday,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import {
  Sun,
  Calendar as CalendarIcon,
  Armchair,
  ArrowRight,
  Ban,
  ChevronLeft,
  ChevronRight,
  Clock,
  Repeat,
  X,
  Check,
} from 'lucide-react';
import clsx from 'clsx';
import { parseNaturalLanguageTask } from '@/lib/services/naturalLanguage';

interface DatePickerPopoverProps {
  initialDate?: string | null;
  initialTime?: string | null;
  initialRecurrence?: string | null;
  onSelect: (data: {
    dueDate: string | null;
    dueTime?: string | null;
    recurrence?: string | null;
  }) => void;
  onClose: () => void;
}

export function DatePickerPopover({
  initialDate,
  initialTime,
  initialRecurrence,
  onSelect,
  onClose,
}: DatePickerPopoverProps) {
  // Use today as fallback base
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState<Date>(
    initialDate ? new Date(initialDate) : today
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initialDate ? new Date(initialDate) : today
  );
  const [time, setTime] = useState<string>(initialTime || '17:00');
  const [hasTime, setHasTime] = useState<boolean>(!!initialTime);
  const [recurrence, setRecurrence] = useState<string | null>(initialRecurrence || null);
  const [inputText, setInputText] = useState<string>(() => {
    if (initialDate) {
      const d = format(new Date(initialDate), 'd MMM');
      return initialTime ? `${d} ${initialTime}` : d;
    }
    return format(today, 'd MMM');
  });

  const [showTimeFlyout, setShowTimeFlyout] = useState(false);
  const [showRepeatFlyout, setShowRepeatFlyout] = useState(false);

  // Month navigation
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Calendar dates
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Quick select helper
  const handleQuickSelect = (date: Date | null) => {
    setSelectedDate(date);
    if (!date) {
      onSelect({ dueDate: null, dueTime: null, recurrence: null });
      onClose();
      return;
    }
    const dateStr = format(date, 'yyyy-MM-dd');
    onSelect({
      dueDate: dateStr,
      dueTime: hasTime ? time : null,
      recurrence,
    });
    onClose();
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const parsed = parseNaturalLanguageTask(inputText, today);
      if (parsed.dueDate) {
        onSelect({
          dueDate: parsed.dueDate,
          dueTime: parsed.dueTime || (hasTime ? time : null),
          recurrence: parsed.recurrence || recurrence,
        });
      }
      onClose();
    }
  };

  return (
    <div className="absolute z-50 mt-1 w-[280px] bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-neutral-700 rounded-xl shadow-2xl p-3 text-xs text-gray-800 dark:text-gray-200 animate-in fade-in zoom-in-95 duration-100">
      {/* Top text input with calendar icon */}
      <div className="relative mb-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Type a date or time..."
          className="w-full pl-3 pr-8 py-1.5 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg text-xs focus:outline-none focus:border-[#1F91EB]"
        />
        <CalendarIcon className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-gray-400 pointer-events-none" />
      </div>

      {/* Quick Option Shortcuts */}
      <div className="space-y-0.5 border-b border-gray-100 dark:border-neutral-800 pb-2 mb-2">
        <button
          type="button"
          onClick={() => handleQuickSelect(addDays(today, 1))}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Tomorrow</span>
          </div>
          <span className="text-gray-400 text-[11px]">
            {format(addDays(today, 1), 'EEE')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(nextFriday(today))}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            <span>Later this week</span>
          </div>
          <span className="text-gray-400 text-[11px]">
            {format(nextFriday(today), 'EEE')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(nextSaturday(today))}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Armchair className="w-3.5 h-3.5 text-indigo-500" />
            <span>This weekend</span>
          </div>
          <span className="text-gray-400 text-[11px]">
            {format(nextSaturday(today), 'EEE')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(nextMonday(today))}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
            <span>Next week</span>
          </div>
          <span className="text-gray-400 text-[11px]">
            {format(nextMonday(today), 'EEE d MMM')}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleQuickSelect(null)}
          className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-left"
        >
          <div className="flex items-center gap-2">
            <Ban className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500">No Date</span>
          </div>
        </button>
      </div>

      {/* Monthly Calendar View */}
      <div className="mb-2">
        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="font-semibold text-xs text-gray-800 dark:text-gray-200">
            {format(currentMonth, 'MMM yyyy')}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 text-center text-[10px] font-medium text-gray-400 mb-1">
          <span>M</span>
          <span>T</span>
          <span>W</span>
          <span>T</span>
          <span>F</span>
          <span>S</span>
          <span>S</span>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-y-1 text-center">
          {calendarDays.map((day) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();

            return (
              <button
                type="button"
                key={day.toISOString()}
                onClick={() => handleQuickSelect(day)}
                className={clsx(
                  'w-7 h-7 mx-auto rounded-full flex items-center justify-center text-xs transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-[#1F91EB] text-white font-bold'
                    : isCurrentDay
                    ? 'text-[#1F91EB] font-bold border border-[#1F91EB]'
                    : isCurrentMonth
                    ? 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    : 'text-gray-300 dark:text-gray-600 hover:bg-gray-50'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar: Time and Repeat */}
      <div className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-1.5">
        {/* Time button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowTimeFlyout(!showTimeFlyout);
              setShowRepeatFlyout(false);
            }}
            className="w-full flex items-center justify-between px-2 py-1.5 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{hasTime ? time : 'Time'}</span>
            </div>
            {hasTime && (
              <X
                className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasTime(false);
                }}
              />
            )}
          </button>

          {/* Time & Duration Flyout */}
          {showTimeFlyout && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl p-3 z-50 text-xs">
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Time</span>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      setHasTime(true);
                    }}
                    className="border border-gray-200 dark:border-neutral-700 rounded px-2 py-1 bg-transparent text-gray-800 dark:text-gray-200 text-xs"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Duration</span>
                  <select className="border border-gray-200 dark:border-neutral-700 rounded px-2 py-1 bg-transparent text-gray-800 dark:text-gray-200 text-xs">
                    <option>No duration</option>
                    <option>15 mins</option>
                    <option>30 mins</option>
                    <option>45 mins</option>
                    <option>1 hour</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Time zone</span>
                  <span className="text-gray-600 dark:text-gray-400 text-[11px]">Floating time</span>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setShowTimeFlyout(false)}
                  className="px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setHasTime(true);
                    setShowTimeFlyout(false);
                  }}
                  className="px-3 py-1 bg-[#1F91EB] text-white rounded font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Repeat Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setShowRepeatFlyout(!showRepeatFlyout);
              setShowTimeFlyout(false);
            }}
            className="w-full flex items-center justify-between px-2 py-1.5 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5 text-gray-400" />
              <span>{recurrence ? recurrence.replace('FREQ=', '') : 'Repeat'}</span>
            </div>
            {recurrence && (
              <X
                className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setRecurrence(null);
                }}
              />
            )}
          </button>

          {/* Repeat Flyout */}
          {showRepeatFlyout && (
            <div className="absolute bottom-full left-0 mb-1 w-full bg-white dark:bg-[#202020] border border-gray-200 dark:border-neutral-700 rounded-xl shadow-xl p-2 z-50 text-xs space-y-1">
              {[
                { label: 'Does not repeat', value: null },
                { label: 'Every day', value: 'FREQ=DAILY' },
                { label: 'Every weekday', value: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR' },
                { label: 'Every week', value: 'FREQ=WEEKLY' },
                { label: 'Every month', value: 'FREQ=MONTHLY' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    setRecurrence(opt.value);
                    setShowRepeatFlyout(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-100 dark:hover:bg-neutral-800 flex items-center justify-between"
                >
                  <span>{opt.label}</span>
                  {recurrence === opt.value && <Check className="w-3.5 h-3.5 text-[#1F91EB]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

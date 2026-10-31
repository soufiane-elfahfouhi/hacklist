import { Priority } from '@/lib/types';
import { addDays, format, nextMonday, nextFriday, nextSaturday, nextSunday, setHours, setMinutes } from 'date-fns';

export interface ParsedTaskInput {
  cleanContent: string;
  dueDate?: string | null;
  dueTime?: string | null;
  priority?: Priority;
  recurrence?: string | null;
  projectTag?: string | null;
  labelTags: string[];
}

export function parseNaturalLanguageTask(input: string, baseDate = new Date()): ParsedTaskInput {
  let content = input;
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let priority: Priority | undefined = undefined;
  let recurrence: string | null = null;
  let projectTag: string | null = null;
  const labelTags: string[] = [];

  // 1. Priority tags: p1, p2, p3, p4 or !!1, !!2, !!3, !!4
  const priorityMatch = content.match(/\b(?:p|!!)([1-4])\b/i);
  if (priorityMatch) {
    priority = parseInt(priorityMatch[1], 10) as Priority;
    content = content.replace(priorityMatch[0], '');
  }

  // 2. Project tag: #ProjectName
  const projectMatch = content.match(/#([a-zA-Z0-9_\-]+)/);
  if (projectMatch) {
    projectTag = projectMatch[1];
    content = content.replace(projectMatch[0], '');
  }

  // 3. Label tags: @label
  const labelMatches = content.matchAll(/@([a-zA-Z0-9_\-]+)/g);
  for (const match of labelMatches) {
    labelTags.push(match[1]);
  }
  content = content.replace(/@[a-zA-Z0-9_\-]+/g, '');

  // 4. Recurrence: every day, every weekday, every week, daily, weekly
  if (/\bevery\s+day\b|\bdaily\b/i.test(content)) {
    recurrence = 'FREQ=DAILY';
    dueDate = format(baseDate, 'yyyy-MM-dd');
    content = content.replace(/\bevery\s+day\b|\bdaily\b/gi, '');
  } else if (/\bevery\s+weekday\b/i.test(content)) {
    recurrence = 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR';
    dueDate = format(baseDate, 'yyyy-MM-dd');
    content = content.replace(/\bevery\s+weekday\b/gi, '');
  } else if (/\bevery\s+week\b|\bweekly\b/i.test(content)) {
    recurrence = 'FREQ=WEEKLY';
    dueDate = format(baseDate, 'yyyy-MM-dd');
    content = content.replace(/\bevery\s+week\b|\bweekly\b/gi, '');
  } else if (/\bevery\s+month\b|\bmonthly\b/i.test(content)) {
    recurrence = 'FREQ=MONTHLY';
    dueDate = format(baseDate, 'yyyy-MM-dd');
    content = content.replace(/\bevery\s+month\b|\bmonthly\b/gi, '');
  }

  // 5. Time extraction: at 5pm, 17:00, 10:30am
  const time12Match = content.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (time12Match) {
    let hours = parseInt(time12Match[1], 10);
    const mins = time12Match[2] ? parseInt(time12Match[2], 10) : 0;
    const meridian = time12Match[3].toLowerCase();
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    dueTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    content = content.replace(time12Match[0], '');
  } else {
    const time24Match = content.match(/\b(?:at\s+)?([01]?\d|2[0-3]):([0-5]\d)\b/i);
    if (time24Match) {
      dueTime = `${time24Match[1].padStart(2, '0')}:${time24Match[2]}`;
      content = content.replace(time24Match[0], '');
    }
  }

  // 6. Dates: today, tomorrow, next week, this weekend, monday, etc.
  if (!recurrence) {
    if (/\btoday\b/i.test(content)) {
      dueDate = format(baseDate, 'yyyy-MM-dd');
      content = content.replace(/\btoday\b/gi, '');
    } else if (/\btomorrow\b/i.test(content)) {
      dueDate = format(addDays(baseDate, 1), 'yyyy-MM-dd');
      content = content.replace(/\btomorrow\b/gi, '');
    } else if (/\bnext\s+week\b/i.test(content)) {
      dueDate = format(nextMonday(baseDate), 'yyyy-MM-dd');
      content = content.replace(/\bnext\s+week\b/gi, '');
    } else if (/\bthis\s+weekend\b/i.test(content)) {
      dueDate = format(nextSaturday(baseDate), 'yyyy-MM-dd');
      content = content.replace(/\bthis\s+weekend\b/gi, '');
    } else if (/\blater\s+this\s+week\b/i.test(content)) {
      dueDate = format(nextFriday(baseDate), 'yyyy-MM-dd');
      content = content.replace(/\blater\s+this\s+week\b/gi, '');
    } else if (/\bnext\s+monday\b/i.test(content)) {
      dueDate = format(nextMonday(baseDate), 'yyyy-MM-dd');
      content = content.replace(/\bnext\s+monday\b/gi, '');
    } else if (/\bnext\s+friday\b/i.test(content)) {
      dueDate = format(nextFriday(baseDate), 'yyyy-MM-dd');
      content = content.replace(/\bnext\s+friday\b/gi, '');
    }
  }

  return {
    cleanContent: content.trim().replace(/\s+/g, ' '),
    dueDate,
    dueTime,
    priority,
    recurrence,
    projectTag,
    labelTags,
  };
}

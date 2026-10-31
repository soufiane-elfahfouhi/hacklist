'use client';

import React, { useState } from 'react';
import { ActivityLogItem } from '@/lib/types';
import { History, CheckCircle, PlusCircle, Trash2, Edit3, MessageSquare, Bot, Globe, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';

interface ActivityViewProps {
  items: ActivityLogItem[];
}

export function ActivityView({ items }: ActivityViewProps) {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = filterType === 'all' ? items : items.filter((i) => i.event_type === filterType);

  const eventIcons: Record<string, any> = {
    added: PlusCircle,
    completed: CheckCircle,
    uncompleted: History,
    updated: Edit3,
    deleted: Trash2,
    commented: MessageSquare,
  };

  const sourceBadges: Record<string, { label: string; icon: any; color: string }> = {
    web: { label: 'Web', icon: Globe, color: 'text-gray-500 bg-gray-100 dark:bg-neutral-800' },
    mcp: { label: 'Antigravity (MCP)', icon: Bot, color: 'text-[#1F91EB] bg-[#1F91EB]/10' },
    gcal: { label: 'Google Calendar', icon: Calendar, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
    api: { label: 'API', icon: Globe, color: 'text-purple-600 bg-purple-50' },
  };

  return (
    <div className="max-w-[800px] mx-auto p-6 space-y-6 select-none">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-neutral-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <History className="w-5 h-5 text-[#1F91EB]" />
            <span>Activity History</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Unlimited audit trail of all task modifications, completions, and AI agent actions.
          </p>
        </div>

        {/* Filter pills */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-neutral-800 p-0.5 rounded-lg text-xs">
          {['all', 'completed', 'added', 'updated'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={clsx(
                'px-2.5 py-1 rounded-md capitalize font-medium transition-all cursor-pointer',
                filterType === t
                  ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs">
            No activity logged yet. Complete or create tasks to see activity here!
          </div>
        ) : (
          filtered.map((item) => {
            const Icon = eventIcons[item.event_type] || Edit3;
            const source = sourceBadges[item.source] || sourceBadges.web;
            const SourceIcon = source.icon;

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs"
              >
                <div className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-600 dark:text-gray-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-gray-900 dark:text-gray-100">
                      <span className="font-semibold capitalize">{item.event_type}</span>{' '}
                      <span className="text-gray-500">{item.object_type}:</span>{' '}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {item.object_title || 'Untitled'}
                      </span>
                    </p>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {format(new Date(item.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>

                  {/* Source Badge */}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className={clsx(
                        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold',
                        source.color
                      )}
                    >
                      <SourceIcon className="w-2.5 h-2.5" />
                      {source.label}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

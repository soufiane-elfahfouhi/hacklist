'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Settings as SettingsIcon,
  Crown,
  Palette,
  Layout,
  PlusCircle,
  TrendingUp,
  Bell,
  HardDrive,
  Cpu,
  Calendar,
  Check,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function SettingsModal({
  isOpen,
  onClose,
  userEmail = 'soufiane.elfahfouhi@gmail.com',
  userName = 'Samlee',
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<
    | 'account'
    | 'general'
    | 'subscription'
    | 'theme'
    | 'productivity'
    | 'calendars'
    | 'integrations'
  >('calendars');

  const [isGCalConnected, setIsGCalConnected] = useState(true);
  const [syncAllDay, setSyncAllDay] = useState(false);
  const [syncToCalendar, setSyncToCalendar] = useState(true);
  const [showEventsInTodoist, setShowEventsInTodoist] = useState(true);

  const [calendarsList, setCalendarsList] = useState([
    { id: 'cal1', name: 'Product Team Meetings', color: '#1F91EB', visible: true },
    { id: 'cal2', name: 'Family & Personal', color: '#ec4899', visible: true },
    { id: 'cal3', name: 'Focus Time & Blocks', color: '#10b981', visible: true },
    { id: 'cal4', name: userEmail, color: '#3b82f6', visible: true },
  ]);

  if (!isOpen) return null;

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-4 h-4" /> },
    { id: 'general', label: 'General', icon: <SettingsIcon className="w-4 h-4" /> },
    { id: 'subscription', label: 'Subscription', icon: <Crown className="w-4 h-4 text-amber-500" /> },
    { id: 'theme', label: 'Theme', icon: <Palette className="w-4 h-4" /> },
    { id: 'productivity', label: 'Productivity', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reminders', label: 'Reminders', icon: <Bell className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Cpu className="w-4 h-4 text-[#1F91EB]" /> },
    { id: 'calendars', label: 'Calendars', icon: <Calendar className="w-4 h-4 text-[#d1453b]" /> },
  ];

  const toggleCalendarVisibility = (id: string) => {
    setCalendarsList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="w-full max-w-[840px] h-[600px] bg-white dark:bg-[#1f1f1f] rounded-2xl shadow-2xl border border-gray-200 dark:border-neutral-800 flex overflow-hidden">
        {/* Left Sidebar Tabs (matching Mobbin media_10.webp) */}
        <div className="w-56 bg-[#fafafa] dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-neutral-800 p-3 flex flex-col justify-between">
          <div>
            <div className="px-2 py-1 mb-2 font-bold text-sm text-gray-800 dark:text-gray-200">
              Settings
            </div>

            <nav className="space-y-0.5 text-xs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={clsx(
                      'w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-left',
                      isActive
                        ? 'bg-[#e3f0fb] dark:bg-[#1F91EB]/25 text-[#1F91EB]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800'
                    )}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-2 border-t border-gray-100 dark:border-neutral-800 text-[11px] text-gray-400">
            Hacklist Pro v9.36.1
          </div>
        </div>

        {/* Right Tab Content */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-neutral-800">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-100 capitalize">
              {activeTab}
            </h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-md cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 text-xs text-gray-700 dark:text-gray-300">
            {/* Calendars Tab (Matching Mobbin media_10.webp precisely) */}
            {activeTab === 'calendars' && (
              <div className="space-y-5">
                {/* Account row */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">
                      G
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{userEmail}</div>
                      <div className="flex items-center gap-1.5 text-emerald-600 font-medium text-[11px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Live Sync Active</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 border border-gray-200 dark:border-neutral-700 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800 font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                      <span>Resync</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsGCalConnected(!isGCalConnected)}
                      className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium cursor-pointer"
                    >
                      {isGCalConnected ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                </div>

                {/* Show events in Todoist toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      Show events in Hacklist
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      Events are shown in Today and Upcoming timeline view.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={showEventsInTodoist}
                    onChange={(e) => setShowEventsInTodoist(e.target.checked)}
                    className="w-4 h-4 accent-[#1F91EB] cursor-pointer"
                  />
                </div>

                {/* Calendars sub-list with eye toggles */}
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
                  {calendarsList.map((cal) => (
                    <div
                      key={cal.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800/60"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-1.5 h-4 rounded-full"
                          style={{ backgroundColor: cal.color }}
                        />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{cal.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleCalendarVisibility(cal.id)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 cursor-pointer p-1"
                      >
                        {cal.visible ? (
                          <Eye className="w-4 h-4 text-[#1F91EB]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-300" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Two-way sync tasks to calendar toggle */}
                <div className="pt-4 border-t border-gray-100 dark:border-neutral-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">
                        Sync tasks to calendar
                      </div>
                      <div className="text-gray-400 text-[11px]">
                        Scheduled tasks will be synced to a new &quot;Hacklist&quot; Google Calendar.
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncToCalendar}
                      onChange={(e) => setSyncToCalendar(e.target.checked)}
                      className="w-4 h-4 accent-[#1F91EB] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        Sync all-day tasks
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={syncAllDay}
                      onChange={(e) => setSyncAllDay(e.target.checked)}
                      className="w-4 h-4 accent-[#1F91EB] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Tab (Showing all Pro features unlocked for free) */}
            {activeTab === 'subscription' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[#1F91EB]/10 via-[#5BADEE]/10 to-transparent border border-[#99CAF1] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-full bg-[#1F91EB] text-white text-[10px] font-bold uppercase tracking-wider">
                      Pro Plan Unlocked
                    </span>
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">
                      Lifetime Pro Member
                    </h3>
                    <p className="text-gray-500 text-[11px]">
                      Enjoy 100% of Todoist Pro features with Antigravity pairing.
                    </p>
                  </div>
                  <Crown className="w-10 h-10 text-amber-500" />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    '300 projects (vs 5 on free)',
                    'Unlimited Ramble voice sessions',
                    'Custom reminders & task deadlines',
                    'Calendar layouts & time-blocking',
                    '150 filter views & saved views',
                    'Unlimited activity history & audits',
                    'Todoist Assist AI & Antigravity MCP',
                    'Two-way Google Calendar live sync',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-gray-200 dark:border-neutral-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#1F91EB]" />
                      <span>Antigravity Streamable HTTP MCP Server</span>
                    </h4>
                    <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px]">
                    Pair Hacklist directly with Antigravity to create, reschedule, time-block, and complete tasks from your agent.
                  </p>
                  <div className="pt-2">
                    <code className="block p-2 rounded bg-black text-gray-200 font-mono text-[11px] break-all">
                      http://localhost:3000/api/mcp
                    </code>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

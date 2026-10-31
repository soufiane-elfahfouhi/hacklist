'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Project, Profile } from '@/lib/types';
import {
  Inbox,
  Calendar,
  CalendarDays,
  Plus,
  BarChart2,
  History,
  Settings,
  ChevronDown,
  Hash,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

interface SidebarProps {
  projects: Project[];
  counts: {
    inbox: number;
    today: number;
    upcoming: number;
  };
  profile?: Profile | null;
  onOpenQuickAdd: () => void;
  onOpenAddProject: () => void;
}

export function Sidebar({
  projects,
  counts,
  profile,
  onOpenQuickAdd,
  onOpenAddProject,
}: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Inbox', href: '/inbox', icon: Inbox, count: counts.inbox, color: 'text-[#1F91EB]' },
    { label: 'Today', href: '/today', icon: Calendar, count: counts.today, color: 'text-emerald-500' },
    { label: 'Upcoming', href: '/upcoming', icon: CalendarDays, count: counts.upcoming, color: 'text-purple-500' },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays, color: 'text-indigo-500' },
  ];

  const secondaryNav = [
    { label: 'Productivity & Karma', href: '/stats', icon: BarChart2 },
    { label: 'Activity History', href: '/activity', icon: History },
    { label: 'Antigravity / API', href: '/settings/integrations', icon: Settings },
  ];

  return (
    <aside className="w-[280px] h-screen bg-[#fafafa] dark:bg-[#1a1a1a] border-r border-[#e5e7eb] dark:border-[#2d2d2d] flex flex-col justify-between select-none">
      <div className="flex-1 overflow-y-auto p-3">
        {/* User Profile Header */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-3 rounded-lg hover:bg-gray-200/50 dark:hover:bg-neutral-800 transition-all cursor-pointer">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-[#1F91EB] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {profile?.full_name ? profile.full_name[0] : 'H'}
            </div>
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 truncate block">
                {profile?.full_name || 'Hacklist Workspace'}
              </span>
              <span className="text-[10px] text-gray-500 flex items-center gap-1 font-medium">
                <Sparkles className="w-2.5 h-2.5 text-[#1F91EB]" />
                Karma: {profile?.karma || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center gap-2.5 px-3 py-2 mb-3 bg-[#1F91EB] hover:bg-[#5BADEE] text-white rounded-lg text-[13px] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add task</span>
        </button>

        {/* Primary Views Nav */}
        <nav className="space-y-0.5 mb-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all',
                  active
                    ? 'bg-[#D6E7F4] text-[#1F91EB] dark:bg-[#1F91EB]/20 dark:text-[#99CAF1]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={clsx('w-4 h-4', item.color)} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Projects Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <span>My Projects</span>
            <button
              onClick={onOpenAddProject}
              className="p-0.5 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-all cursor-pointer"
              title="Add project"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-0.5 mt-1">
            {projects
              .filter((p) => !p.is_inbox)
              .map((project) => {
                const href = `/project/${project.id}`;
                const active = pathname === href;
                return (
                  <Link
                    key={project.id}
                    href={href}
                    className={clsx(
                      'flex items-center justify-between px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all group',
                      active
                        ? 'bg-[#D6E7F4] text-[#1F91EB] dark:bg-[#1F91EB]/20 dark:text-[#99CAF1]'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color || '#1F91EB' }}
                      />
                      <span className="truncate">{project.name}</span>
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="p-3 border-t border-[#e5e7eb] dark:border-[#2d2d2d] space-y-0.5">
        {secondaryNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-all',
                active
                  ? 'bg-gray-200 dark:bg-neutral-800 text-gray-900 dark:text-white font-semibold'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-neutral-800'
              )}
            >
              <Icon className="w-4 h-4 text-gray-400" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}

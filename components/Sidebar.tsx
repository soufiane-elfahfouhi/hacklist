'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Project, Profile } from '@/lib/types';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  MoreHorizontal,
  BarChart2,
  Settings,
  CalendarDays,
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
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const todayDateNum = new Date().getDate();

  const navItems = [
    {
      id: 'inbox',
      label: 'Inbox',
      href: '/inbox',
      count: counts.inbox,
      icon: (
        <svg className="w-5 h-5 text-[#246fe0]" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5v-3h3.56c.69 1.19 1.97 2 3.44 2s2.75-.81 3.44-2H19v3zm0-5h-4.99c0 1.1-.9 2-2.01 2s-2.01-.9-2.01-2H5V5h14v9z" />
        </svg>
      ),
    },
    {
      id: 'today',
      label: 'Today',
      href: '/today',
      count: counts.today,
      icon: (
        <div className="relative w-5 h-5 flex items-center justify-center text-[#058527]">
          {/* Calendar icon with date number inside */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
            <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
            <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="absolute bottom-[2px] text-[9px] font-bold text-[#058527] leading-none">
            {todayDateNum}
          </span>
        </div>
      ),
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      href: '/upcoming',
      count: counts.upcoming,
      icon: (
        <svg className="w-5 h-5 text-[#692fc2]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
          <line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" />
          <line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <circle cx="8" cy="15" r="1.2" fill="currentColor" />
          <circle cx="12" cy="15" r="1.2" fill="currentColor" />
          <circle cx="16" cy="15" r="1.2" fill="currentColor" />
        </svg>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      href: '/calendar',
      icon: (
        <CalendarDays className="w-5 h-5 text-[#1F91EB]" />
      ),
    },
  ];

  return (
    <aside className="w-[280px] h-full bg-[#fafafa] dark:bg-[#1f1f1f] border-r border-[#ececec] dark:border-[#2b2b2b] flex flex-col justify-between select-none">
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {/* Workspace / User Selector Row */}
        <div className="flex items-center justify-between px-2 py-1.5 mb-2 rounded-md hover:bg-[#eee] dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-[#1F91EB] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {profile?.full_name ? profile.full_name[0] : 'H'}
            </div>
            <span className="text-[14px] font-semibold text-gray-800 dark:text-gray-200 truncate">
              {profile?.full_name || 'My Workspace'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        </div>

        {/* Add Task Button (Todoist standard inline style) */}
        <button
          onClick={onOpenQuickAdd}
          className="w-full flex items-center gap-2.5 px-2 py-1.5 mb-3 rounded-md text-[14px] font-medium text-gray-700 dark:text-gray-300 hover:bg-[#eee] dark:hover:bg-[#2c2c2c] transition-colors cursor-pointer group"
        >
          <div className="w-5 h-5 rounded-full bg-[#1F91EB] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-semibold text-[#1F91EB]">Add task</span>
        </button>

        {/* Core Navigation List */}
        <nav className="space-y-0.5 mb-6">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  'flex items-center justify-between px-2 py-1.5 rounded-md text-[14px] font-normal transition-colors group',
                  active
                    ? 'bg-[#e0effa] dark:bg-[#1F91EB]/20 text-[#1F91EB] dark:text-[#99CAF1] font-semibold'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-[#eee] dark:hover:bg-[#2c2c2c]'
                )}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex-shrink-0">{item.icon}</div>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[12px] text-gray-500 dark:text-gray-400 font-mono">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Projects Section (Collapsible Header with Hover Actions) */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 py-1 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors group cursor-pointer">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1.5 flex-1 text-left font-bold"
            >
              {projectsExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <span>My Projects</span>
            </button>

            {/* Hover + button to add project */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddProject();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Add project"
            >
              <Plus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Projects List */}
          {projectsExpanded && (
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
                        'flex items-center justify-between px-2.5 py-1.5 rounded-md text-[14px] transition-colors group',
                        active
                          ? 'bg-[#e0effa] dark:bg-[#1F91EB]/20 text-[#1F91EB] dark:text-[#99CAF1] font-semibold'
                          : 'text-gray-800 dark:text-gray-200 hover:bg-[#eee] dark:hover:bg-[#2c2c2c]'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* 8px Colored Project Circle Dot */}
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: project.color || '#1F91EB' }}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>

                      {/* Options icon on hover */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-300/60 dark:hover:bg-neutral-600 rounded transition-opacity cursor-pointer"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: Stats & Settings */}
      <div className="p-2 border-t border-[#ececec] dark:border-[#2b2b2b] space-y-0.5">
        <Link
          href="/stats"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-gray-600 dark:text-gray-400 hover:bg-[#eee] dark:hover:bg-[#2c2c2c] transition-colors"
        >
          <BarChart2 className="w-4 h-4 text-gray-500" />
          <span>Productivity & Karma</span>
        </Link>
        <Link
          href="/settings/integrations"
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] text-gray-600 dark:text-gray-400 hover:bg-[#eee] dark:hover:bg-[#2c2c2c] transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-500" />
          <span>Antigravity MCP Settings</span>
        </Link>
      </div>
    </aside>
  );
}

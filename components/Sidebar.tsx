'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Project, Profile } from '@/lib/types';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Search,
  CheckCircle2,
  Calendar,
  CalendarDays,
  LayoutGrid,
  Bell,
  PanelLeftClose,
  HelpCircle,
  Hash,
  Folder,
  Waves,
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
  onOpenSettings?: () => void;
  onToggleCollapse?: () => void;
}

export function Sidebar({
  projects,
  counts,
  profile,
  onOpenQuickAdd,
  onOpenAddProject,
  onOpenSettings,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const todayDateNum = new Date().getDate();

  const navItems = [
    {
      id: 'search',
      label: 'Search',
      href: '/today',
      icon: <Search className="w-4 h-4 text-gray-500" />,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      href: '/inbox',
      count: counts.inbox,
      icon: (
        <svg className="w-4 h-4 text-[#246fe0]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 12h-6l-2 3h-4l-2-3H2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7z" />
          <path d="M5.45 5.11L2 12v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-7l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
      ),
    },
    {
      id: 'today',
      label: 'Today',
      href: '/today',
      count: counts.today,
      icon: (
        <div className="relative w-4 h-4 flex items-center justify-center text-[#1F91EB]">
          <Calendar className="w-4 h-4" />
          <span className="absolute top-[4px] text-[8px] font-bold text-[#1F91EB] leading-none">
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
      icon: <CalendarDays className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 'filters',
      label: 'Filters & Labels',
      href: '/calendar',
      icon: <LayoutGrid className="w-4 h-4 text-amber-600" />,
    },
    {
      id: 'completed',
      label: 'Completed',
      href: '/activity',
      icon: <CheckCircle2 className="w-4 h-4 text-gray-400" />,
    },
  ];

  return (
    <aside className="w-[280px] h-full bg-[#fcfaf8] dark:bg-[#1a1a1a] border-r border-[#f1eeea] dark:border-[#2b2b2b] flex flex-col justify-between select-none font-sans">
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {/* Top Header Row: User Profile & Actions (Exact Todoist Web Header) */}
        <div className="flex items-center justify-between mb-3 px-1">
          {/* User profile dropdown button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 py-1 px-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer text-left"
          >
            <div className="w-6 h-6 rounded-full bg-[#1F91EB] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
              {profile?.full_name ? profile.full_name[0] : 'H'}
            </div>
            <span className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">
              {profile?.full_name || 'My Workspace'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
          </button>

          {/* Right Action Icons: Bell & Sidebar Collapse */}
          <div className="flex items-center gap-0.5 text-gray-500">
            <Link
              href="/activity"
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors"
              title="Notifications & Activity"
            >
              <Bell className="w-4 h-4" />
            </Link>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-md transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Add Task Button Row with Ramble Audio Wave Icon */}
        <div className="flex items-center gap-1 mb-2 px-1">
          <button
            onClick={onOpenQuickAdd}
            className="flex-1 flex items-center gap-2 py-1.5 px-2 text-[14px] font-semibold text-[#1F91EB] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer group"
          >
            <div className="w-4 h-4 rounded-full bg-[#1F91EB] text-white flex items-center justify-center">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Add task</span>
          </button>
          <button
            onClick={onOpenQuickAdd}
            className="p-1.5 text-[#1F91EB] hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            title="Ramble Audio Brain Dump"
          >
            <Waves className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List Items */}
        <nav className="space-y-0.5 mb-6">
          {navItems.map((item) => {
            const active = pathname === item.href && item.id !== 'search';
            return (
              <Link
                key={item.id}
                href={item.href}
                className={clsx(
                  'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-colors',
                  active
                    ? 'bg-[#e3f0fb] dark:bg-[#1F91EB]/25 text-[#1F91EB] font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[11px] text-gray-400 font-mono font-medium">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* My Projects Collapsible Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between px-2.5 py-1 text-[13px] font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 transition-colors group">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center gap-1.5 flex-1 text-left cursor-pointer"
            >
              {projectsExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              )}
              <span>My Projects</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAddProject();
              }}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
              title="Add project"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>

          {/* Project Items */}
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
                        'flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[13px] transition-colors group',
                        active
                          ? 'bg-[#e3f0fb] dark:bg-[#1F91EB]/25 text-[#1F91EB] font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5 font-medium'
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Hash
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: project.color || '#1F91EB' }}
                        />
                        <span className="truncate">{project.name}</span>
                      </div>
                    </Link>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Footer Row: Help & Antigravity MCP Settings */}
      <div className="p-3 border-t border-[#f1eeea] dark:border-[#2b2b2b]">
        <Link
          href="/settings/integrations"
          className="flex items-center gap-2 px-2 py-1 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-gray-400" />
          <span>Help & Antigravity MCP</span>
        </Link>
      </div>
    </aside>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  Menu,
  Home,
  Search,
  Plus,
  Bell,
  HelpCircle,
  Sparkles,
  Command,
} from 'lucide-react';
import clsx from 'clsx';

interface TopHeaderProps {
  onToggleSidebar: () => void;
  onOpenQuickAdd: () => void;
}

export function TopHeader({ onToggleSidebar, onOpenQuickAdd }: TopHeaderProps) {
  const { profile, counts, setIsQuickAddOpen } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  return (
    <header className="h-[44px] bg-[#1F91EB] text-white flex items-center justify-between px-3 z-30 select-none shadow-xs">
      {/* Left side: Navigation icons & Quick find search */}
      <div className="flex items-center gap-1.5 flex-1 max-w-md">
        {/* Toggle sidebar button */}
        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-all cursor-pointer"
          title="Toggle sidebar (M)"
        >
          <Menu className="w-4 h-4 text-white" />
        </button>

        {/* Home button (goes to Today) */}
        <Link
          href="/today"
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-all"
          title="Go to Today (H)"
        >
          <Home className="w-4 h-4 text-white" />
        </Link>

        {/* Quick find Search input */}
        <div className="relative flex-1 max-w-[280px] ml-1">
          <div
            className={clsx(
              'flex items-center gap-2 px-2.5 py-1 rounded-md text-xs transition-all',
              isSearchFocused
                ? 'bg-white text-gray-900 shadow-md ring-2 ring-white/40'
                : 'bg-white/20 text-white placeholder-white/70 hover:bg-white/25'
            )}
          >
            <Search
              className={clsx(
                'w-3.5 h-3.5 flex-shrink-0',
                isSearchFocused ? 'text-gray-500' : 'text-white/80'
              )}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder="Search (Ctrl + K)"
              className="bg-transparent border-none outline-none w-full text-xs placeholder-inherit"
            />
            {!isSearchFocused && (
              <span className="text-[10px] bg-black/15 px-1.5 py-0.5 rounded font-mono font-medium text-white/80 flex items-center gap-0.5">
                <Command className="w-2.5 h-2.5" />K
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right side: Quick Add, Karma progress, Notifications, Profile */}
      <div className="flex items-center gap-1">
        {/* Quick Add Button (+) */}
        <button
          onClick={onOpenQuickAdd}
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-all cursor-pointer"
          title="Quick add task (Q)"
        >
          <Plus className="w-5 h-5 text-white stroke-[2.5]" />
        </button>

        {/* Productivity Karma Score / Goal Pill */}
        <Link
          href="/stats"
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/20 text-xs font-semibold transition-all"
          title="Productivity & Karma Stats"
        >
          {/* Circular mini progress ring */}
          <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white flex items-center justify-center" />
          <span className="text-[12px] font-bold">
            {counts.today}/5
          </span>
        </Link>

        {/* Activity & History */}
        <Link
          href="/activity"
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-all"
          title="Activity log"
        >
          <Sparkles className="w-4 h-4 text-white" />
        </Link>

        {/* Notifications */}
        <button
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-all cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-white" />
        </button>

        {/* Help & Antigravity MCP settings */}
        <Link
          href="/settings/integrations"
          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/20 transition-all"
          title="Antigravity MCP Settings"
        >
          <HelpCircle className="w-4 h-4 text-white" />
        </Link>

        {/* User Profile Avatar */}
        <div
          className="w-7 h-7 rounded-full bg-white text-[#1F91EB] flex items-center justify-center text-xs font-bold uppercase ml-1 cursor-pointer shadow-xs hover:ring-2 hover:ring-white/50 transition-all"
          title={profile?.full_name || 'Hacklist Profile'}
        >
          {profile?.full_name ? profile.full_name[0] : 'H'}
        </div>
      </div>
    </header>
  );
}

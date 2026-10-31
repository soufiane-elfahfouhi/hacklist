'use client';

import React, { useState, useEffect } from 'react';
import { ApiToken } from '@/lib/types';
import { Settings, Key, Copy, Check, Bot, Calendar, Sparkles, RefreshCw } from 'lucide-react';

export function IntegrationsView() {
  const [tokens, setTokens] = useState<ApiToken[]>([]);
  const [tokenName, setTokenName] = useState('');
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchTokens = async () => {
    try {
      const res = await fetch('/api/tokens');
      if (res.ok) {
        const data = await res.json();
        setTokens(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: tokenName.trim() || 'Antigravity MCP Token' }),
      });
      if (res.ok) {
        const data = await res.json();
        setGeneratedToken(data.token);
        setTokenName('');
        fetchTokens();
      }
    } finally {
      setLoading(false);
    }
  };

  const appUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hacklist.vercel.app';
  const mcpConfigSnippet = JSON.stringify(
    {
      mcpServers: {
        hacklist: {
          url: `${appUrl}/api/mcp/k/${generatedToken || 'YOUR_API_TOKEN_HERE'}`,
        },
      },
    },
    null,
    2
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  return (
    <div className="max-w-[800px] mx-auto p-6 space-y-6 select-none">
      <div className="pb-4 border-b border-gray-200 dark:border-neutral-800">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1F91EB]" />
          <span>Integrations & Antigravity MCP</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Connect Hacklist with Antigravity AI coding assistant and two-way Google Calendar sync.
        </p>
      </div>

      {/* 1. Antigravity MCP Integration */}
      <div className="p-5 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1F91EB]/15 text-[#1F91EB] flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Antigravity Model Context Protocol (MCP)</h2>
              <p className="text-xs text-gray-500">
                Gives Antigravity full access to read, create, update, and manage your tasks, projects, and reminders.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 text-[11px] font-semibold rounded-full">
            Streamable HTTP
          </span>
        </div>

        {/* Generate Token Form */}
        <form onSubmit={handleGenerateToken} className="flex gap-2">
          <input
            type="text"
            value={tokenName}
            onChange={(e) => setTokenName(e.target.value)}
            placeholder="Token name (e.g. Work Antigravity)"
            className="flex-1 text-xs px-3 py-2 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-lg focus:outline-none focus:border-[#1F91EB]"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[#1F91EB] hover:bg-[#5BADEE] text-white text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Generate Token</span>
          </button>
        </form>

        {/* Newly Generated Token Notice */}
        {generatedToken && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-lg space-y-2">
            <div className="text-xs font-bold text-amber-800 dark:text-amber-200">
              New Token Created! Copy it now (it will not be displayed again):
            </div>
            <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-neutral-900 rounded border border-amber-200 font-mono text-xs">
              <span className="truncate">{generatedToken}</span>
              <button
                onClick={() => copyToClipboard(generatedToken)}
                className="text-gray-500 hover:text-gray-800 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Antigravity Config Instructions */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Antigravity Configuration (<code className="font-mono text-[11px]">~/.gemini/config/mcp_config.json</code>):
            </span>
            <button
              onClick={() => copyToClipboard(mcpConfigSnippet)}
              className="flex items-center gap-1 text-xs text-[#1F91EB] hover:underline cursor-pointer font-medium"
            >
              {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSnippet ? 'Copied' : 'Copy snippet'}</span>
            </button>
          </div>
          <pre className="p-3 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono overflow-x-auto">
            {mcpConfigSnippet}
          </pre>
        </div>
      </div>

      {/* 2. Google Calendar Two-Way Sync */}
      <div className="p-5 bg-white dark:bg-[#202020] rounded-xl border border-gray-200 dark:border-neutral-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900 dark:text-gray-100">Google Calendar Two-Way Sync</h2>
              <p className="text-xs text-gray-500">
                Syncs timed tasks to your dedicated &quot;Hacklist&quot; calendar and pulls Google events into your calendar view.
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 text-[11px] font-semibold rounded-full">
            Active via Google Sign-In
          </span>
        </div>
      </div>
    </div>
  );
}

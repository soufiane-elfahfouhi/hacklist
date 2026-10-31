'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const supabase = createClient();
      const origin = window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback`,
          scopes: 'openid email profile https://www.googleapis.com/auth/calendar',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) setError(error.message);
    } catch (e: any) {
      setError(e.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#181818] p-4 select-none">
      <div className="w-full max-w-md p-8 bg-white dark:bg-[#222222] rounded-2xl shadow-xl border border-gray-200 dark:border-neutral-800 text-center space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1F91EB] text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Hacklist</h1>
          <p className="text-xs text-gray-500">
            Precision task management, time-blocking, and Antigravity AI MCP integration.
          </p>
        </div>

        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        {/* Continue with Google button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-100 font-semibold text-sm rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-60"
        >
          {/* Official Google G SVG */}
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>

        <div className="pt-2 text-[11px] text-gray-400">
          Everything is 100% free and unlocked.
        </div>
      </div>
    </div>
  );
}

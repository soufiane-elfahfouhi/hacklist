'use client';

import React, { useState, useEffect } from 'react';
import { ActivityView } from '@/components/ActivityView';
import { ActivityLogItem } from '@/lib/types';

export default function GlobalActivityPage() {
  const [items, setItems] = useState<ActivityLogItem[]>([]);

  useEffect(() => {
    const now = new Date();
    setItems([
      {
        id: 'act-1',
        user_id: 'local-user',
        event_type: 'added',
        object_type: 'task',
        object_id: 't-1',
        object_title: 'Welcome to Hacklist! 🚀',
        source: 'web',
        created_at: now.toISOString(),
      },
      {
        id: 'act-2',
        user_id: 'local-user',
        event_type: 'added',
        object_type: 'task',
        object_id: 't-2',
        object_title: 'Connect Antigravity MCP Server',
        source: 'mcp',
        created_at: new Date(now.getTime() - 3600000).toISOString(),
      },
    ]);
  }, []);

  return <ActivityView items={items} />;
}

import { test } from 'node:test';
import assert from 'node:assert';
import { MCP_TOOLS } from '../lib/mcp/server';

test('Hacklist MCP Tools declaration', () => {
  const toolNames = MCP_TOOLS.map((t) => t.name);
  assert.ok(toolNames.includes('get_overview'), 'has get_overview');
  assert.ok(toolNames.includes('list_tasks'), 'has list_tasks');
  assert.ok(toolNames.includes('get_task'), 'has get_task');
  assert.ok(toolNames.includes('add_task'), 'has add_task');
  assert.ok(toolNames.includes('update_task'), 'has update_task');
  assert.ok(toolNames.includes('complete_task'), 'has complete_task');
  assert.ok(toolNames.includes('delete_task'), 'has delete_task');
  assert.ok(toolNames.includes('list_projects'), 'has list_projects');
  assert.ok(toolNames.includes('add_project'), 'has add_project');
  assert.ok(toolNames.includes('get_stats'), 'has get_stats');
});

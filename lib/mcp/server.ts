import { createAdminClient } from '@/lib/supabase/admin';
import * as taskService from '@/lib/services/tasks';
import * as projectService from '@/lib/services/projects';
import * as sectionService from '@/lib/services/sections';
import * as labelService from '@/lib/services/labels';
import * as statsService from '@/lib/services/stats';
import crypto from 'crypto';

// Authenticate API token
export async function authenticateToken(rawToken: string): Promise<string | null> {
  if (!rawToken || !rawToken.startsWith('hl_')) return null;

  const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('api_tokens')
    .select('user_id, id')
    .eq('token_hash', hash)
    .is('revoked_at', null)
    .single();

  if (error || !data) return null;

  // Update last_used_at in background
  supabase
    .from('api_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id)
    .then();

  return data.user_id;
}

export const MCP_TOOLS = [
  {
    name: 'get_overview',
    description: 'Get an overview of current tasks: tasks due today, overdue tasks, and karma productivity stats.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'list_tasks',
    description: 'List tasks with optional filters for project, section, priority, and completion status.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Filter by Project UUID' },
        sectionId: { type: 'string', description: 'Filter by Section UUID' },
        completed: { type: 'boolean', description: 'Whether to show completed tasks (default false)' },
        dueFilter: {
          type: 'string',
          enum: ['today', 'upcoming', 'overdue', 'all'],
          description: 'Filter tasks by due date status',
        },
      },
    },
  },
  {
    name: 'get_task',
    description: 'Retrieve details for a specific task including sub-tasks and labels.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task UUID' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'add_task',
    description: 'Add a new task to Hacklist with priority (1=highest, 4=default), due date, deadline, or recurrence.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Target Project UUID (defaults to Inbox if omitted)' },
        content: { type: 'string', description: 'Task title or summary' },
        description: { type: 'string', description: 'Detailed notes or markdown description' },
        priority: { type: 'number', enum: [1, 2, 3, 4], description: 'Priority level (1=P1 Red, 2=P2 Orange, 3=P3 Blue, 4=P4 Default)' },
        dueDate: { type: 'string', description: 'Due date in YYYY-MM-DD format' },
        dueAt: { type: 'string', description: 'Exact due timestamp in ISO format' },
        durationMin: { type: 'number', description: 'Duration in minutes for calendar time-blocking (default 30)' },
        recurrence: { type: 'string', description: 'RFC 5545 RRULE string (e.g. FREQ=DAILY, FREQ=WEEKLY;BYDAY=MO)' },
        deadline: { type: 'string', description: 'Hard deadline date in YYYY-MM-DD format (distinct from due date)' },
        sectionId: { type: 'string', description: 'Section UUID within the project' },
        parentId: { type: 'string', description: 'Parent Task UUID if this is a sub-task' },
      },
      required: ['content'],
    },
  },
  {
    name: 'update_task',
    description: 'Update properties of an existing task.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task UUID' },
        content: { type: 'string' },
        description: { type: 'string' },
        priority: { type: 'number', enum: [1, 2, 3, 4] },
        dueDate: { type: 'string' },
        dueAt: { type: 'string' },
        recurrence: { type: 'string' },
        deadline: { type: 'string' },
        projectId: { type: 'string' },
        sectionId: { type: 'string' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'complete_task',
    description: 'Mark a task as complete. If recurring, rolls over to the next occurrence automatically.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task UUID' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'uncomplete_task',
    description: 'Mark a completed task as uncompleted/active.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task UUID' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete a task permanently.',
    inputSchema: {
      type: 'object',
      properties: {
        taskId: { type: 'string', description: 'Task UUID' },
      },
      required: ['taskId'],
    },
  },
  {
    name: 'list_projects',
    description: 'List all active projects for the user.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'add_project',
    description: 'Create a new project.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Project name' },
        color: { type: 'string', description: 'Hex color code (e.g. #1F91EB)' },
        viewStyle: { type: 'string', enum: ['list', 'board', 'calendar'], description: 'Default view layout' },
        isFavorite: { type: 'boolean' },
      },
      required: ['name'],
    },
  },
  {
    name: 'list_sections',
    description: 'List sections in a project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project UUID' },
      },
      required: ['projectId'],
    },
  },
  {
    name: 'add_section',
    description: 'Add a new section to a project.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: { type: 'string', description: 'Project UUID' },
        name: { type: 'string', description: 'Section name' },
      },
      required: ['projectId', 'name'],
    },
  },
  {
    name: 'get_stats',
    description: 'Get productivity statistics, daily/weekly streak and Karma level.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

export async function handleMcpToolCall(userId: string, toolName: string, args: any) {
  const supabase = createAdminClient();

  switch (toolName) {
    case 'get_overview': {
      const todayTasks = await taskService.getTasks(supabase, userId, { dueFilter: 'today', completed: false });
      const overdueTasks = await taskService.getTasks(supabase, userId, { dueFilter: 'overdue', completed: false });
      const stats = await statsService.getProductivityStats(supabase, userId);
      return {
        todayCount: todayTasks.length,
        todayTasks: todayTasks.slice(0, 10),
        overdueCount: overdueTasks.length,
        overdueTasks: overdueTasks.slice(0, 10),
        stats,
      };
    }

    case 'list_tasks': {
      return await taskService.getTasks(supabase, userId, {
        projectId: args?.projectId,
        sectionId: args?.sectionId,
        completed: args?.completed,
        dueFilter: args?.dueFilter,
      });
    }

    case 'get_task': {
      const task = await taskService.getTaskById(supabase, userId, args.taskId);
      if (!task) throw new Error(`Task ${args.taskId} not found`);
      return task;
    }

    case 'add_task': {
      let projectId = args.projectId;
      if (!projectId) {
        // Find default inbox
        const projects = await projectService.getProjects(supabase, userId);
        const inbox = projects.find(p => p.is_inbox) || projects[0];
        if (!inbox) throw new Error('No projects found to create task in');
        projectId = inbox.id;
      }

      return await taskService.createTask(supabase, userId, {
        projectId,
        content: args.content,
        description: args.description,
        priority: args.priority,
        dueDate: args.dueDate,
        dueAt: args.dueAt,
        durationMin: args.durationMin,
        recurrence: args.recurrence,
        deadline: args.deadline,
        sectionId: args.sectionId,
        parentId: args.parentId,
        source: 'mcp',
      });
    }

    case 'update_task': {
      return await taskService.updateTask(supabase, userId, args.taskId, args, 'mcp');
    }

    case 'complete_task': {
      return await taskService.completeTask(supabase, userId, args.taskId, 'mcp');
    }

    case 'uncomplete_task': {
      await taskService.uncompleteTask(supabase, userId, args.taskId, 'mcp');
      return { uncompleted: true };
    }

    case 'delete_task': {
      await taskService.deleteTask(supabase, userId, args.taskId, 'mcp');
      return { deleted: true };
    }

    case 'list_projects': {
      return await projectService.getProjects(supabase, userId);
    }

    case 'add_project': {
      return await projectService.createProject(supabase, userId, {
        name: args.name,
        color: args.color,
        viewStyle: args.viewStyle,
        isFavorite: args.isFavorite,
        source: 'mcp',
      });
    }

    case 'list_sections': {
      return await sectionService.getSections(supabase, userId, args.projectId);
    }

    case 'add_section': {
      return await sectionService.createSection(supabase, userId, {
        projectId: args.projectId,
        name: args.name,
        source: 'mcp',
      });
    }

    case 'get_stats': {
      return await statsService.getProductivityStats(supabase, userId);
    }

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

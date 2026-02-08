#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');

// Load tasks from file
async function loadTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tasks: [], lastId: 0 };
  }
}

// Save tasks to file
async function saveTasks(data) {
  await fs.mkdir(path.dirname(TASKS_FILE), { recursive: true });
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
}

// Create server instance
const server = new Server(
  {
    name: 'task-queue-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_task',
        description: 'Create a new task in the queue',
        inputSchema: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'Task description',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high', 'critical'],
              description: 'Task priority',
            },
            category: {
              type: 'string',
              description: 'Task category (automation, research, communication, development)',
            },
            due_date: {
              type: 'string',
              description: 'ISO 8601 due date (optional)',
            },
            dependencies: {
              type: 'array',
              items: { type: 'string' },
              description: 'Task IDs this task depends on',
            },
          },
          required: ['description', 'priority', 'category'],
        },
      },
      {
        name: 'get_next_task',
        description: 'Get the next pending task based on priority and dependencies',
        inputSchema: {
          type: 'object',
          properties: {
            category: {
              type: 'string',
              description: 'Filter by category (optional)',
            },
          },
        },
      },
      {
        name: 'update_task_status',
        description: 'Update task status',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Task ID',
            },
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'failed'],
              description: 'New status',
            },
            result: {
              type: 'string',
              description: 'Result or error message',
            },
          },
          required: ['id', 'status'],
        },
      },
      {
        name: 'list_tasks',
        description: 'List tasks by status',
        inputSchema: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['pending', 'in_progress', 'completed', 'failed', 'all'],
              description: 'Filter by status',
            },
            category: {
              type: 'string',
              description: 'Filter by category',
            },
          },
        },
      },
      {
        name: 'delete_task',
        description: 'Delete a task',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Task ID',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const data = await loadTasks();

    switch (name) {
      case 'create_task': {
        const task = {
          id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          description: args.description,
          priority: args.priority,
          category: args.category,
          status: 'pending',
          due_date: args.due_date || null,
          dependencies: args.dependencies || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          result: null,
        };

        data.tasks.push(task);
        data.lastId++;
        await saveTasks(data);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, task }, null, 2),
            },
          ],
        };
      }

      case 'get_next_task': {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        
        let availableTasks = data.tasks.filter(t => t.status === 'pending');
        
        if (args.category) {
          availableTasks = availableTasks.filter(t => t.category === args.category);
        }

        // Filter tasks with unmet dependencies
        availableTasks = availableTasks.filter(task => {
          if (task.dependencies.length === 0) return true;
          
          return task.dependencies.every(depId => {
            const dep = data.tasks.find(t => t.id === depId);
            return dep && dep.status === 'completed';
          });
        });

        // Sort by priority and created date
        availableTasks.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return new Date(a.created_at) - new Date(b.created_at);
        });

        const task = availableTasks[0] || null;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, task }, null, 2),
            },
          ],
        };
      }

      case 'update_task_status': {
        const taskIndex = data.tasks.findIndex(t => t.id === args.id);
        
        if (taskIndex === -1) {
          throw new Error(`Task ${args.id} not found`);
        }

        data.tasks[taskIndex].status = args.status;
        data.tasks[taskIndex].updated_at = new Date().toISOString();
        
        if (args.result) {
          data.tasks[taskIndex].result = args.result;
        }

        if (args.status === 'completed') {
          data.tasks[taskIndex].completed_at = new Date().toISOString();
        }

        await saveTasks(data);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, task: data.tasks[taskIndex] }, null, 2),
            },
          ],
        };
      }

      case 'list_tasks': {
        let tasks = data.tasks;

        if (args.status && args.status !== 'all') {
          tasks = tasks.filter(t => t.status === args.status);
        }

        if (args.category) {
          tasks = tasks.filter(t => t.category === args.category);
        }

        // Sort by priority and created date
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        tasks.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return new Date(b.created_at) - new Date(a.created_at);
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, tasks, count: tasks.length }, null, 2),
            },
          ],
        };
      }

      case 'delete_task': {
        const taskIndex = data.tasks.findIndex(t => t.id === args.id);
        
        if (taskIndex === -1) {
          throw new Error(`Task ${args.id} not found`);
        }

        const deletedTask = data.tasks.splice(taskIndex, 1)[0];
        await saveTasks(data);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, task: deletedTask }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Task Queue MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

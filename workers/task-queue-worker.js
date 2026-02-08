#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'worker.log');
const TASK_QUEUE_PATH = path.join(process.env.HOME, 'proactive-assistant', 'mcp-servers', 'task-queue', 'index.js');

// Ensure log directory exists
async function ensureLogDir() {
  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
}

// Logging function
async function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  await fs.appendFile(LOG_FILE, logMessage);
  console.error(logMessage.trim());
}

// Call MCP tool
async function callMCPTool(toolName, args = {}) {
  return new Promise((resolve, reject) => {
    const argsString = JSON.stringify(args);
    const input = JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: argsString
      }
    });

    const mcp = spawn('node', [TASK_QUEUE_PATH], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    mcp.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    mcp.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    mcp.on('close', (code) => {
      if (code === 0) {
        try {
          const response = JSON.parse(stdout);
          resolve(response);
        } catch (e) {
          reject(new Error(`Failed to parse MCP response: ${stdout}`));
        }
      } else {
        reject(new Error(`MCP process exited with code ${code}: ${stderr}`));
      }
    });

    mcp.stdin.write(input);
    mcp.stdin.end();
  });
}

// Execute task with Claude Code
async function executeTask(task) {
  await log(`Executing task: ${task.id}`);
  await log(`Description: ${task.description}`);
  await log(`Priority: ${task.priority}`);

  // Import the appropriate subagent based on category
  const subagentMap = {
    automation: 'automation',
    research: 'researcher',
    communication: 'communicator',
    development: 'developer'
  };

  const subagent = subagentMap[task.category] || 'automation';

  // Execute via Claude Code CLI
  return new Promise((resolve, reject) => {
    const claude = spawn('claude', [
      '-p',
      `/agent:${subagent} Execute this task: ${task.description}`,
      '--output-format',
      'stream-json'
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let errors = '';

    claude.stdout.on('data', (data) => {
      output += data.toString();
    });

    claude.stderr.on('data', (data) => {
      errors += data.toString();
    });

    claude.on('close', async (code) => {
      if (code === 0) {
        await log(`Task ${task.id} completed successfully`);
        resolve({ success: true, output });
      } else {
        await log(`Task ${task.id} failed with code ${code}: ${errors}`);
        reject(new Error(errors));
      }
    });
  });
}

// Main worker loop
async function main() {
  await ensureLogDir();
  await log('=== Worker Started ===');

  try {
    // Get next task
    await log('Fetching next task...');
    const taskResult = await callMCPTool('get_next_task', {});
    
    if (!taskResult.task) {
      await log('No tasks available, exiting');
      process.exit(0);
    }

    const task = JSON.parse(taskResult.task);
    await log(`Task found: ${task.id}`);

    // Update task status to in_progress
    await callMCPTool('update_task_status', {
      id: task.id,
      status: 'in_progress'
    });

    // Execute task
    try {
      const result = await executeTask(task);

      // Mark as completed
      await callMCPTool('update_task_status', {
        id: task.id,
        status: 'completed',
        result: JSON.stringify(result)
      });

      await log(`Task ${task.id} marked as completed`);
    } catch (error) {
      // Mark as failed
      await callMCPTool('update_task_status', {
        id: task.id,
        status: 'failed',
        result: error.message
      });

      await log(`Task ${task.id} marked as failed: ${error.message}`);
      throw error;
    }

  } catch (error) {
    await log(`Worker error: ${error.message}`);
    process.exit(1);
  }

  await log('=== Worker Completed ===');
}

// Handle cleanup
process.on('SIGINT', async () => {
  await log('Worker interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await log('Worker terminated');
  process.exit(0);
});

// Run
main().catch(async (error) => {
  await log(`Fatal error: ${error.message}`);
  process.exit(1);
});

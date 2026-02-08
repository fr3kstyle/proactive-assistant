#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const CLAUDE_CONFIG_DIR = path.join(process.env.HOME, '.claude');
const MCP_CONFIG_FILE = path.join(CLAUDE_CONFIG_DIR, 'mcp.json');

async function ensureClaudeConfig() {
  await fs.mkdir(CLAUDE_CONFIG_DIR, { recursive: true });
}

async function setupMCP() {
  await ensureClaudeConfig();
  
  const mcpConfig = {
    mcpServers: {
      'task-queue': {
        command: 'node',
        args: [path.join(process.env.HOME, 'proactive-assistant', 'mcp-servers', 'task-queue', 'index.js')]
      },
      'memory-manager': {
        command: 'node',
        args: [path.join(process.env.HOME, 'proactive-assistant', 'mcp-servers', 'memory-manager', 'index.js')]
      }
    }
  };
  
  await fs.writeFile(MCP_CONFIG_FILE, JSON.stringify(mcpConfig, null, 2));
  console.log('MCP servers configured successfully');
  console.log(`Config file: ${MCP_CONFIG_FILE}`);
}

setupMCP().catch(console.error);

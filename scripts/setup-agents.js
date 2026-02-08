#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const AGENTS_DIR = path.join(process.env.HOME, 'proactive-assistant', '.claude', 'agents');
const CLAUDE_AGENTS_DIR = path.join(process.env.HOME, '.claude', 'agents');

async function setupAgents() {
  await fs.mkdir(CLADE_AGENTS_DIR, { recursive: true });
  
  const agents = ['automation', 'researcher', 'communicator', 'developer'];
  
  for (const agent of agents) {
    const source = path.join(AGENTS_DIR, `${agent}.md`);
    const dest = path.join(CLAUDE_AGENTS_DIR, `${agent}.md`);
    
    try {
      await fs.copyFile(source, dest);
      console.log(`✓ Copied ${agent} agent`);
    } catch (error) {
      console.error(`✗ Failed to copy ${agent} agent: ${error.message}`);
    }
  }
  
  console.log('\nAgents configured successfully');
  console.log(`Agent directory: ${CLAUDE_AGENTS_DIR}`);
}

setupAgents().catch(console.error);

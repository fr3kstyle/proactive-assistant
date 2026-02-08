#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');
const MEMORY_INDEX = path.join(process.env.HOME, '.claude', 'memory', 'index.json');
const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'worker.log');

async function getStats() {
  // Load tasks
  let tasksData;
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    tasksData = JSON.parse(content);
  } catch {
    tasksData = { tasks: [] };
  }
  
  // Load memories
  let memData;
  try {
    const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
    memData = JSON.parse(content);
  } catch {
    memData = { memories: [], categories: [] };
  }
  
  // Load logs
  let logLines = 0;
  try {
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    logLines = content.split('\n').filter(l => l.trim()).length;
  } catch {}
  
  // Calculate stats
  const taskStats = {
    total: tasksData.tasks.length,
    pending: tasksData.tasks.filter(t => t.status === 'pending').length,
    in_progress: tasksData.tasks.filter(t => t.status === 'in_progress').length,
    completed: tasksData.tasks.filter(t => t.status === 'completed').length,
    failed: tasksData.tasks.filter(t => t.status === 'failed').length,
    byPriority: {
      critical: tasksData.tasks.filter(t => t.priority === 'critical').length,
      high: tasksData.tasks.filter(t => t.priority === 'high').length,
      medium: tasksData.tasks.filter(t => t.priority === 'medium').length,
      low: tasksData.tasks.filter(t => t.priority === 'low').length
    }
  };
  
  const memoryStats = {
    total: memData.memories.length,
    categories: memData.categories.length,
    byType: memData.memories.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {}),
    avgImportance: memData.memories.length > 0
      ? (memData.memories.reduce((sum, m) => sum + m.importance, 0) / memData.memories.length).toFixed(2)
      : 0
  };
  
  return { taskStats, memoryStats, logLines };
}

async function displayStats() {
  const stats = await getStats();
  
  console.log('\n📊 Proactive Assistant Monitor\n');
  console.log('═'.repeat(50));
  
  console.log('\n📋 Task Queue');
  console.log('─'.repeat(50));
  console.log(`Total Tasks: ${stats.taskStats.total}`);
  console.log(`  Pending:     ${stats.taskStats.pending}`);
  console.log(`  In Progress: ${stats.taskStats.in_progress}`);
  console.log(`  Completed:   ${stats.taskStats.completed}`);
  console.log(`  Failed:      ${stats.taskStats.failed}`);
  
  console.log('\nBy Priority:');
  console.log(`  Critical: ${stats.taskStats.byPriority.critical}`);
  console.log(`  High:     ${stats.taskStats.byPriority.high}`);
  console.log(`  Medium:   ${stats.taskStats.byPriority.medium}`);
  console.log(`  Low:      ${stats.taskStats.byPriority.low}`);
  
  console.log('\n🧠 Memory System');
  console.log('─'.repeat(50));
  console.log(`Total Memories: ${stats.memoryStats.total}`);
  console.log(`Categories:     ${stats.memoryStats.categories}`);
  console.log(`Avg Importance: ${stats.memoryStats.avgImportance}`);
  
  console.log('\nBy Type:');
  Object.entries(stats.memoryStats.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  console.log('\n📝 Logs');
  console.log('─'.repeat(50));
  console.log(`Log entries: ${stats.logLines}`);
  
  console.log('\n' + '═'.repeat(50) + '\n');
}

displayStats().catch(console.error);

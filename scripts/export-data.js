#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');
const MEMORY_INDEX = path.join(process.env.HOME, '.claude', 'memory', 'index.json');
const EXPORT_DIR = path.join(process.env.HOME, 'proactive-assistant', 'exports');

async function exportData() {
  console.log('📤 Exporting Proactive Assistant data...\n');
  
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  
  const timestamp = new Date().toISOString().split('T')[0];
  
  // Export tasks
  const tasksData = await fs.readFile(TASKS_FILE, 'utf-8');
  const tasksFile = path.join(EXPORT_DIR, `tasks_${timestamp}.json`);
  await fs.writeFile(tasksFile, tasksData);
  console.log(`✅ Tasks exported to: ${tasksFile}`);
  
  // Export memories
  const memData = await fs.readFile(MEMORY_INDEX, 'utf-8');
  const memFile = path.join(EXPORT_DIR, `memories_${timestamp}.json`);
  await fs.writeFile(memFile, memData);
  console.log(`✅ Memories exported to: ${memFile}`);
  
  // Create summary
  const tasks = JSON.parse(tasksData);
  const memories = JSON.parse(memData);
  
  const summary = {
    exportDate: new Date().toISOString(),
    tasks: {
      total: tasks.tasks.length,
      pending: tasks.tasks.filter(t => t.status === 'pending').length,
      completed: tasks.tasks.filter(t => t.status === 'completed').length,
      failed: tasks.tasks.filter(t => t.status === 'failed').length
    },
    memories: {
      total: memories.memories.length,
      categories: memories.categories.length
    }
  };
  
  const summaryFile = path.join(EXPORT_DIR, `summary_${timestamp}.json`);
  await fs.writeFile(summaryFile, JSON.stringify(summary, null, 2));
  console.log(`✅ Summary exported to: ${summaryFile}`);
  
  console.log('\n📊 Export Summary:');
  console.log(`   Tasks: ${summary.tasks.total} total`);
  console.log(`   Memories: ${summary.memories.total} total`);
  console.log(`   Categories: ${summary.memories.categories}`);
  
  console.log('\n✅ Export complete!\n');
}

exportData().catch(console.error);

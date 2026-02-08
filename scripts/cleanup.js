#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');
const MEMORY_INDEX = path.join(process.env.HOME, '.claude', 'memory', 'index.json');
const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'worker.log');

async function cleanupOldTasks(daysOld = 7) {
  console.log('🧹 Cleaning up old completed tasks...\n');
  
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
  
  const content = await fs.readFile(TASKS_FILE, 'utf-8');
  const data = JSON.parse(content);
  
  const originalCount = data.tasks.length;
  
  // Remove completed tasks older than cutoff
  data.tasks = data.tasks.filter(task => {
    if (task.status === 'completed' && task.completed_at) {
      const completedDate = new Date(task.completed_at);
      return completedDate > cutoffDate;
    }
    return true;
  });
  
  const removedCount = originalCount - data.tasks.length;
  
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
  
  console.log(`✅ Removed ${removedCount} old completed tasks`);
  console.log(`   Kept ${data.tasks.length} tasks`);
}

async function decayOldMemories(threshold = 0.01) {
  console.log('\n🧠 Decaying old memories...\n');
  
  const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
  const data = JSON.parse(content);
  
  let decayedCount = 0;
  
  data.memories.forEach(memory => {
    const daysSinceAccess = (Date.now() - new Date(memory.accessed_at).getTime()) / (1000 * 60 * 60 * 24);
    const accessFactor = Math.log(memory.access_count + 1) * 0.1;
    const timeFactor = 1 / (daysSinceAccess + 1);
    
    memory.decay_score = (accessFactor * timeFactor).toFixed(4);
    
    if (parseFloat(memory.decay_score) < threshold) {
      decayedCount++;
    }
  });
  
  await fs.writeFile(MEMORY_INDEX, JSON.stringify(data, null, 2));
  
  console.log(`✅ Updated decay scores for ${data.memories.length} memories`);
  console.log(`   ${decayedCount} memories below threshold (${threshold})`);
}

async function rotateLogs(maxLines = 1000) {
  console.log('\n📝 Rotating logs...\n');
  
  try {
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    const lines = content.split('\n');
    
    if (lines.length > maxLines) {
      const backupFile = LOG_FILE + '.old';
      const trimmedContent = lines.slice(-maxLines).join('\n');
      
      await fs.writeFile(backupFile, content);
      await fs.writeFile(LOG_FILE, trimmedContent);
      
      console.log(`✅ Rotated logs (${lines.length} -> ${maxLines} lines)`);
      console.log(`   Backup saved to ${backupFile}`);
    } else {
      console.log(`✅ Log file within limit (${lines.length} lines)`);
    }
  } catch {
    console.log('ℹ️  No log file to rotate');
  }
}

async function main() {
  console.log('='.repeat(50));
  console.log('Proactive Assistant - Cleanup Script');
  console.log('='.repeat(50));
  
  await cleanupOldTasks(7);
  await decayOldMemories(0.01);
  await rotateLogs(1000);
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ Cleanup complete!');
  console.log('='.repeat(50) + '\n');
}

main().catch(console.error);

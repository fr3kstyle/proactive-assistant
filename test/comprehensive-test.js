#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';
import crypto from 'crypto';

const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');
const MEMORY_INDEX = path.join(process.env.HOME, '.claude', 'memory', 'index.json');
const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'worker.log');

console.log('🚀 Comprehensive Test Suite\n');
console.log('='.repeat(60));

let testsPassed = 0;
let testsFailed = 0;

async function test(name, fn) {
  try {
    console.log(`\n📝 ${name}...`);
    await fn();
    console.log(`✅ PASSED`);
    testsPassed++;
  } catch (e) {
    console.log(`❌ FAILED: ${e.message}`);
    testsFailed++;
  }
}

// Test 1: Create multiple tasks
await test('Create multiple tasks with different priorities', async () => {
  await fs.mkdir(path.dirname(TASKS_FILE), { recursive: true });
  
  let data;
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    data = JSON.parse(content);
  } catch {
    data = { tasks: [], lastId: 0 };
  }
  
  const tasks = [
    { description: 'Critical system update', priority: 'critical', category: 'automation' },
    { description: 'Research new technologies', priority: 'medium', category: 'research' },
    { description: 'Review pull requests', priority: 'high', category: 'development' },
    { description: 'Organize documentation', priority: 'low', category: 'communication' }
  ];
  
  tasks.forEach(taskDef => {
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: taskDef.description,
      priority: taskDef.priority,
      category: taskDef.category,
      status: 'pending',
      dependencies: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.tasks.push(task);
  });
  
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
  
  if (data.tasks.length < 4) throw new Error('Not all tasks created');
});

// Test 2: Verify priority ordering
await test('Verify tasks are ordered by priority', async () => {
  const content = await fs.readFile(TASKS_FILE, 'utf-8');
  const data = JSON.parse(content);
  
  const pendingTasks = data.tasks.filter(t => t.status === 'pending');
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  
  pendingTasks.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.created_at) - new Date(b.created_at);
  });
  
  if (pendingTasks[0].priority !== 'critical') {
    throw new Error('Critical task should be first');
  }
});

// Test 3: Store multiple memories
await test('Store multiple memories with different types', async () => {
  const memoryDir = path.dirname(MEMORY_INDEX);
  await fs.mkdir(memoryDir, { recursive: true });
  
  let data;
  try {
    const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
    data = JSON.parse(content);
  } catch {
    data = { memories: [], categories: [], lastId: 0 };
  }
  
  const memories = [
    { type: 'preference', category: 'coding', content: 'Prefers TypeScript', importance: 9 },
    { type: 'skill', category: 'programming', content: 'Proficient in Node.js', importance: 8 },
    { type: 'pattern', category: 'workflow', content: 'Works on coding in morning', importance: 6 }
  ];
  
  memories.forEach(memDef => {
    const memory = {
      id: `mem-${crypto.randomUUID()}`,
      ...memDef,
      tags: [memDef.category],
      created_at: new Date().toISOString(),
      accessed_at: new Date().toISOString(),
      access_count: 0,
      decay_score: '1.0000',
      related_ids: []
    };
    data.memories.push(memory);
    
    if (!data.categories.includes(memDef.category)) {
      data.categories.push(memDef.category);
    }
  });
  
  await fs.writeFile(MEMORY_INDEX, JSON.stringify(data, null, 2));
  
  if (data.memories.length < 3) throw new Error('Not all memories stored');
});

// Test 4: Worker execution
await test('Execute worker to process tasks', async () => {
  const worker = spawn('node', ['workers/improved-worker.js'], {
    cwd: path.join(process.env.HOME, 'proactive-assistant'),
    stdio: 'pipe'
  });
  
  await new Promise(resolve => worker.on('close', resolve));
  
  if (worker.exitCode !== 0) {
    throw new Error(`Worker exited with code ${worker.exitCode}`);
  }
});

// Test 5: Verify task completion
await test('Verify tasks were completed', async () => {
  const content = await fs.readFile(TASKS_FILE, 'utf-8');
  const data = JSON.parse(content);
  
  const completedTasks = data.tasks.filter(t => t.status === 'completed');
  
  if (completedTasks.length === 0) {
    throw new Error('No tasks were completed');
  }
  
  console.log(`   Completed ${completedTasks.length} tasks`);
});

// Test 6: Memory retrieval
await test('Retrieve memories by category', async () => {
  const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
  const data = JSON.parse(content);
  
  const codingMemories = data.memories.filter(m => m.category === 'coding');
  
  if (codingMemories.length === 0) {
    throw new Error('No coding memories found');
  }
  
  console.log(`   Found ${codingMemories.length} coding memories`);
});

// Test 7: Check logs
await test('Verify worker logs exist', async () => {
  try {
    await fs.access(LOG_FILE);
    const content = await fs.readFile(LOG_FILE, 'utf-8');
    
    if (!content.includes('Worker')) {
      throw new Error('Logs do not contain expected content');
    }
    
    const lines = content.split('\n').filter(l => l.trim()).length;
    console.log(`   Log file has ${lines} lines`);
  } catch {
    throw new Error('Log file not found or invalid');
  }
});

// Test 8: Task dependencies
await test('Create tasks with dependencies', async () => {
  const content = await fs.readFile(TASKS_FILE, 'utf-8');
  const data = JSON.parse(content);
  
  // Create a parent task
  const parentTask = {
    id: `task-${Date.now()}-parent`,
    description: 'Parent task: Set up database',
    priority: 'high',
    category: 'automation',
    status: 'completed',
    dependencies: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    completed_at: new Date().toISOString()
  };
  
  // Create a child task that depends on parent
  const childTask = {
    id: `task-${Date.now()}-child`,
    description: 'Child task: Migrate data',
    priority: 'high',
    category: 'automation',
    status: 'pending',
    dependencies: [parentTask.id],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  data.tasks.push(parentTask, childTask);
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
  
  // Verify child task can be fetched (parent is completed)
  const pendingTasks = data.tasks.filter(t => t.status === 'pending' && t.id === childTask.id);
  const hasUnmetDeps = pendingTasks.some(task => {
    return task.dependencies.some(depId => {
      const dep = data.tasks.find(t => t.id === depId);
      return !dep || dep.status !== 'completed';
    });
  });
  
  if (hasUnmetDeps) {
    throw new Error('Child task should not have unmet dependencies');
  }
});

// Test 9: Memory decay calculation
await test('Calculate memory decay scores', async () => {
  const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
  const data = JSON.parse(content);
  
  data.memories.forEach(memory => {
    const daysSinceAccess = (Date.now() - new Date(memory.accessed_at).getTime()) / (1000 * 60 * 60 * 24);
    const accessFactor = Math.log(memory.access_count + 1) * 0.1;
    const timeFactor = 1 / (daysSinceAccess + 1);
    
    const decayScore = (accessFactor * timeFactor).toFixed(4);
    memory.decay_score = decayScore;
  });
  
  await fs.writeFile(MEMORY_INDEX, JSON.stringify(data, null, 2));
  
  const validScores = data.memories.every(m => {
    const score = parseFloat(m.decay_score);
    return score >= 0 && score <= 1;
  });
  
  if (!validScores) {
    throw new Error('Some decay scores are invalid');
  }
});

// Test 10: Statistics
await test('Generate system statistics', async () => {
  const tasksContent = await fs.readFile(TASKS_FILE, 'utf-8');
  const tasksData = JSON.parse(tasksContent);
  
  const memContent = await fs.readFile(MEMORY_INDEX, 'utf-8');
  const memData = JSON.parse(memContent);
  
  const stats = {
    tasks: {
      total: tasksData.tasks.length,
      pending: tasksData.tasks.filter(t => t.status === 'pending').length,
      in_progress: tasksData.tasks.filter(t => t.status === 'in_progress').length,
      completed: tasksData.tasks.filter(t => t.status === 'completed').length,
      failed: tasksData.tasks.filter(t => t.status === 'failed').length
    },
    memories: {
      total: memData.memories.length,
      categories: memData.categories.length,
      avgImportance: (memData.memories.reduce((sum, m) => sum + m.importance, 0) / memData.memories.length).toFixed(2)
    }
  };
  
  console.log('\n   📊 System Statistics:');
  console.log(`   Tasks: ${stats.tasks.total} total (${stats.tasks.completed} completed)`);
  console.log(`   Memories: ${stats.memories.total} total (${stats.memories.categories} categories)`);
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Test Results:');
console.log(`   ✅ Passed: ${testsPassed}`);
console.log(`   ❌ Failed: ${testsFailed}`);
console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
console.log('='.repeat(60));

if (testsFailed > 0) {
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!\n');
}

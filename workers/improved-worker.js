#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { spawn } from 'child_process';

const LOG_FILE = path.join(process.env.HOME, '.claude', 'logs', 'worker.log');
const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');

// Logging with timestamps
async function log(level, message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level}] ${message}\n`;
  
  await fs.mkdir(path.dirname(LOG_FILE), { recursive: true });
  await fs.appendFile(LOG_FILE, logMessage);
  console.log(`[${level}] ${message}`);
}

// Load tasks
async function loadTasks() {
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return { tasks: [], lastId: 0 };
  }
}

// Save tasks
async function saveTasks(data) {
  await fs.mkdir(path.dirname(TASKS_FILE), { recursive: true });
  await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
}

// Get next task
async function getNextTask(category = null) {
  const data = await loadTasks();
  let tasks = data.tasks.filter(t => t.status === 'pending');
  
  if (category) {
    tasks = tasks.filter(t => t.category === category);
  }
  
  // Filter by dependencies
  tasks = tasks.filter(task => {
    if (task.dependencies.length === 0) return true;
    
    return task.dependencies.every(depId => {
      const dep = data.tasks.find(t => t.id === depId);
      return dep && dep.status === 'completed';
    });
  });
  
  if (tasks.length === 0) return null;
  
  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  tasks.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.created_at) - new Date(b.created_at);
  });
  
  return tasks[0];
}

// Update task status
async function updateTaskStatus(taskId, status, result = null) {
  const data = await loadTasks();
  const task = data.tasks.find(t => t.id === taskId);
  
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }
  
  task.status = status;
  task.updated_at = new Date().toISOString();
  
  if (result) {
    task.result = result;
  }
  
  if (status === 'completed') {
    task.completed_at = new Date().toISOString();
  }
  
  await saveTasks(data);
  return task;
}

// Execute task
async function executeTask(task) {
  await log('INFO', `Executing task: ${task.id}`);
  await log('INFO', `Description: ${task.description}`);
  await log('INFO', `Priority: ${task.priority}`);
  
  // Simulate task execution
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mark as completed
  const result = `Task completed successfully at ${new Date().toISOString()}`;
  await updateTaskStatus(task.id, 'completed', result);
  
  await log('INFO', `Task ${task.id} completed`);
  return { success: true, result };
}

// Main worker loop
async function main() {
  await log('INFO', '=== Worker Started ===');
  
  try {
    // Get next task
    const task = await getNextTask();
    
    if (!task) {
      await log('INFO', 'No tasks available, exiting');
      process.exit(0);
    }
    
    await log('INFO', `Task found: ${task.id}`);
    
    // Update to in_progress
    await updateTaskStatus(task.id, 'in_progress');
    
    // Execute task
    await executeTask(task);
    
  } catch (error) {
    await log('ERROR', `Worker error: ${error.message}`);
    process.exit(1);
  }
  
  await log('INFO', '=== Worker Completed ===');
}

// Handle cleanup
process.on('SIGINT', async () => {
  await log('INFO', 'Worker interrupted');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await log('INFO', 'Worker terminated');
  process.exit(0);
});

// Run
main().catch(async (error) => {
  await log('ERROR', `Fatal error: ${error.message}`);
  process.exit(1);
});

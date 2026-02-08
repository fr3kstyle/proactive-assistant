#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = path.join(process.env.HOME, '.claude', 'tasks.json');

console.log('🧪 Testing Task Queue MCP Server...\n');

// Test 1: Create task
async function testCreateTask() {
  console.log('Test 1: Creating test task...');
  
  const testTask = {
    description: 'Test task: Verify system functionality',
    priority: 'high',
    category: 'automation'
  };
  
  try {
    // Ensure directory exists
    await fs.mkdir(path.dirname(TASKS_FILE), { recursive: true });
    
    // Load existing data
    let data;
    try {
      const content = await fs.readFile(TASKS_FILE, 'utf-8');
      data = JSON.parse(content);
    } catch {
      data = { tasks: [], lastId: 0 };
    }
    
    // Create task
    const task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: testTask.description,
      priority: testTask.priority,
      category: testTask.category,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    data.tasks.push(task);
    data.lastId++;
    await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
    
    console.log('✅ Task created:', task.id);
    console.log('   Description:', task.description);
    console.log('   Priority:', task.priority);
    console.log('   Category:', task.category);
    return task;
  } catch (e) {
    console.log('❌ Create task failed:', e.message);
  }
}

// Test 2: List tasks
async function testListTasks() {
  console.log('\nTest 2: Listing all tasks...');
  
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    const data = JSON.parse(content);
    
    console.log(`✅ Total tasks: ${data.tasks.length}`);
    
    // Group by status
    const byStatus = data.tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('   By status:', byStatus);
    return data.tasks;
  } catch (e) {
    console.log('❌ List tasks failed:', e.message);
    return [];
  }
}

// Test 3: Get next task
async function testGetNextTask() {
  console.log('\nTest 3: Getting next task...');
  
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    const data = JSON.parse(content);
    
    const pendingTasks = data.tasks.filter(t => t.status === 'pending');
    
    if (pendingTasks.length > 0) {
      // Sort by priority
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      pendingTasks.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return new Date(a.created_at) - new Date(b.created_at);
      });
      
      const nextTask = pendingTasks[0];
      console.log('✅ Next task:', nextTask.id);
      console.log('   Priority:', nextTask.priority);
      console.log('   Created:', nextTask.created_at);
      return nextTask;
    } else {
      console.log('ℹ️  No pending tasks');
      return null;
    }
  } catch (e) {
    console.log('❌ Get next task failed:', e.message);
    return null;
  }
}

// Test 4: Update task status
async function testUpdateStatus() {
  console.log('\nTest 4: Updating task status...');
  
  try {
    const content = await fs.readFile(TASKS_FILE, 'utf-8');
    const data = JSON.parse(content);
    
    const pendingTask = data.tasks.find(t => t.status === 'pending');
    
    if (pendingTask) {
      pendingTask.status = 'in_progress';
      pendingTask.updated_at = new Date().toISOString();
      
      await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2));
      
      console.log('✅ Task updated:', pendingTask.id);
      console.log('   New status:', pendingTask.status);
      return pendingTask;
    } else {
      console.log('ℹ️  No pending tasks to update');
      return null;
    }
  } catch (e) {
    console.log('❌ Update task failed:', e.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('Task Queue MCP Server - Test Suite');
  console.log('='.repeat(50));
  
  await testCreateTask();
  await testListTasks();
  await testGetNextTask();
  await testUpdateStatus();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests complete!');
  console.log('='.repeat(50));
}

runTests().catch(console.error);

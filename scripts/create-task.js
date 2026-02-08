#!/usr/bin/env node

const taskDescription = process.argv.slice(2).join(' ');

if (!taskDescription) {
  console.error('Usage: npm run task:create "Task description"');
  process.exit(1);
}

const task = {
  description: taskDescription,
  priority: 'medium',
  category: 'automation'
};

console.log(JSON.stringify(task, null, 2));

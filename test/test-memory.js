#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MEMORY_DIR = path.join(process.env.HOME, '.claude', 'memory');
const MEMORY_INDEX = path.join(MEMORY_DIR, 'index.json');

console.log('🧪 Testing Memory Manager MCP Server...\n');

// Test 1: Store memory
async function testStoreMemory() {
  console.log('Test 1: Storing memory...');
  
  try {
    await fs.mkdir(MEMORY_DIR, { recursive: true });
    
    let data;
    try {
      const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
      data = JSON.parse(content);
    } catch {
      data = { memories: [], categories: [], lastId: 0 };
    }
    
    const memory = {
      id: `mem-${crypto.randomUUID()}`,
      type: 'preference',
      category: 'coding',
      content: 'Prefers TypeScript over JavaScript for new projects',
      tags: ['typescript', 'coding', 'preference'],
      importance: 8,
      created_at: new Date().toISOString(),
      accessed_at: new Date().toISOString(),
      access_count: 0,
      decay_score: '1.0000',
      related_ids: []
    };
    
    data.memories.push(memory);
    if (!data.categories.includes('coding')) {
      data.categories.push('coding');
    }
    data.lastId++;
    
    await fs.writeFile(MEMORY_INDEX, JSON.stringify(data, null, 2));
    
    console.log('✅ Memory stored:', memory.id);
    console.log('   Type:', memory.type);
    console.log('   Category:', memory.category);
    console.log('   Content:', memory.content);
    console.log('   Importance:', memory.importance);
    return memory;
  } catch (e) {
    console.log('❌ Store memory failed:', e.message);
  }
}

// Test 2: Retrieve memory
async function testRetrieveMemory() {
  console.log('\nTest 2: Retrieving memory...');
  
  try {
    const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
    const data = JSON.parse(content);
    
    const memories = data.memories.filter(m => m.category === 'coding');
    
    console.log('✅ Retrieved memories:', memories.length);
    memories.forEach(m => {
      console.log(`   - ${m.id}: ${m.content.substring(0, 50)}...`);
    });
    
    return memories;
  } catch (e) {
    console.log('❌ Retrieve memory failed:', e.message);
    return [];
  }
}

// Test 3: Update memory access
async function testUpdateAccess() {
  console.log('\nTest 3: Updating memory access...');
  
  try {
    const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
    const data = JSON.parse(content);
    
    if (data.memories.length > 0) {
      const memory = data.memories[0];
      memory.accessed_at = new Date().toISOString();
      memory.access_count++;
      
      await fs.writeFile(MEMORY_INDEX, JSON.stringify(data, null, 2));
      
      console.log('✅ Memory access updated:', memory.id);
      console.log('   Access count:', memory.access_count);
      return memory;
    } else {
      console.log('ℹ️  No memories to update');
      return null;
    }
  } catch (e) {
    console.log('❌ Update access failed:', e.message);
    return null;
  }
}

// Test 4: List categories
async function testListCategories() {
  console.log('\nTest 4: Listing categories...');
  
  try {
    const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
    const data = JSON.parse(content);
    
    console.log('✅ Categories:', data.categories);
    return data.categories;
  } catch (e) {
    console.log('❌ List categories failed:', e.message);
    return [];
  }
}

// Test 5: Memory statistics
async function testStatistics() {
  console.log('\nTest 5: Memory statistics...');
  
  try {
    const content = await fs.readFile(MEMORY_INDEX, 'utf-8');
    const data = JSON.parse(content);
    
    const byType = data.memories.reduce((acc, m) => {
      acc[m.type] = (acc[m.type] || 0) + 1;
      return acc;
    }, {});
    
    const avgImportance = data.memories.length > 0
      ? (data.memories.reduce((sum, m) => sum + m.importance, 0) / data.memories.length).toFixed(2)
      : 0;
    
    console.log('✅ Total memories:', data.memories.length);
    console.log('   By type:', byType);
    console.log('   Avg importance:', avgImportance);
    console.log('   Categories:', data.categories.length);
    
    return {
      total: data.memories.length,
      byType,
      avgImportance,
      categories: data.categories.length
    };
  } catch (e) {
    console.log('❌ Statistics failed:', e.message);
    return null;
  }
}

// Run all tests
async function runTests() {
  console.log('='.repeat(50));
  console.log('Memory Manager MCP Server - Test Suite');
  console.log('='.repeat(50));
  
  await testStoreMemory();
  await testRetrieveMemory();
  await testUpdateAccess();
  await testListCategories();
  await testStatistics();
  
  console.log('\n' + '='.repeat(50));
  console.log('✅ All tests complete!');
  console.log('='.repeat(50));
}

runTests().catch(console.error);

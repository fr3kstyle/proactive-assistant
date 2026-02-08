#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

const MEMORY_DIR = path.join(process.env.HOME, '.claude', 'memory');
const MEMORY_INDEX = path.join(MEMORY_DIR, 'index.json');

// Ensure memory directory exists
async function ensureMemoryDir() {
  await fs.mkdir(MEMORY_DIR, { recursive: true });
}

// Load memory index
async function loadIndex() {
  try {
    const data = await fs.readFile(MEMORY_INDEX, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { memories: [], categories: [], lastId: 0 };
  }
}

// Save memory index
async function saveIndex(data) {
  await fs.writeFile(MEMORY_INDEX, JSON.stringify(data, null, 2));
}

// Calculate decay score based on access patterns
function calculateDecayScore(memory) {
  const daysSinceAccess = (Date.now() - new Date(memory.accessed_at).getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceCreation = (Date.now() - new Date(memory.created_at).getTime()) / (1000 * 60 * 60 * 24);
  
  // Decay based on time and access frequency
  const accessFactor = Math.log(memory.access_count + 1) * 0.1;
  const timeFactor = 1 / (daysSinceAccess + 1);
  const ageFactor = 1 / (daysSinceCreation + 1);
  
  return (accessFactor * timeFactor * ageFactor).toFixed(4);
}

// Create server instance
const server = new Server(
  {
    name: 'memory-manager-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'store_memory',
        description: 'Store a new memory with temporal metadata',
        inputSchema: {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['preference', 'skill', 'pattern', 'decision', 'fact', 'interaction'],
              description: 'Memory type',
            },
            category: {
              type: 'string',
              description: 'Memory category (e.g., coding, communication, research)',
            },
            content: {
              type: 'string',
              description: 'Memory content',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tags for retrieval',
            },
            importance: {
              type: 'number',
              minimum: 1,
              maximum: 10,
              description: 'Importance score (1-10)',
            },
          },
          required: ['type', 'category', 'content'],
        },
      },
      {
        name: 'retrieve_memory',
        description: 'Retrieve memories by query, category, or relevance',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query',
            },
            category: {
              type: 'string',
              description: 'Filter by category',
            },
            type: {
              type: 'string',
              description: 'Filter by type',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Filter by tags',
            },
            limit: {
              type: 'number',
              description: 'Maximum results',
            },
            min_decay_score: {
              type: 'number',
              description: 'Minimum decay score',
            },
          },
        },
      },
      {
        name: 'merge_memories',
        description: 'Merge related memories into a consolidated entry',
        inputSchema: {
          type: 'object',
          properties: {
            memory_ids: {
              type: 'array',
              items: { type: 'string' },
              description: 'Memory IDs to merge',
            },
            merged_content: {
              type: 'string',
              description: 'Merged content',
            },
          },
          required: ['memory_ids', 'merged_content'],
        },
      },
      {
        name: 'decay_old_memories',
        description: 'Archive or delete low-value memories',
        inputSchema: {
          type: 'object',
          properties: {
            min_decay_score: {
              type: 'number',
              description: 'Minimum decay score threshold (default: 0.01)',
            },
            action: {
              type: 'string',
              enum: ['archive', 'delete'],
              description: 'Action to take (archive or delete)',
            },
          },
        },
      },
      {
        name: 'list_categories',
        description: 'List all memory categories',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'update_memory_access',
        description: 'Update memory access statistics',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Memory ID',
            },
          },
          required: ['id'],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    await ensureMemoryDir();
    const index = await loadIndex();

    switch (name) {
      case 'store_memory': {
        const memory = {
          id: `mem-${crypto.randomUUID()}`,
          type: args.type,
          category: args.category,
          content: args.content,
          tags: args.tags || [],
          importance: args.importance || 5,
          created_at: new Date().toISOString(),
          accessed_at: new Date().toISOString(),
          access_count: 0,
          decay_score: '1.0000',
          related_ids: [],
        };

        index.memories.push(memory);
        
        if (!index.categories.includes(args.category)) {
          index.categories.push(args.category);
        }
        
        index.lastId++;
        await saveIndex(index);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, memory }, null, 2),
            },
          ],
        };
      }

      case 'retrieve_memory': {
        let memories = index.memories;

        // Apply filters
        if (args.category) {
          memories = memories.filter(m => m.category === args.category);
        }
        
        if (args.type) {
          memories = memories.filter(m => m.type === args.type);
        }
        
        if (args.tags && args.tags.length > 0) {
          memories = memories.filter(m => 
            args.tags.some(tag => m.tags.includes(tag))
          );
        }

        // Text search
        if (args.query) {
          const queryLower = args.query.toLowerCase();
          memories = memories.filter(m => 
            m.content.toLowerCase().includes(queryLower) ||
            m.category.toLowerCase().includes(queryLower) ||
            m.tags.some(t => t.toLowerCase().includes(queryLower))
          );
        }

        // Decay score filter
        if (args.min_decay_score) {
          memories = memories.filter(m => parseFloat(m.decay_score) >= args.min_decay_score);
        }

        // Sort by decay score and recency
        memories.sort((a, b) => {
          const decayDiff = parseFloat(b.decay_score) - parseFloat(a.decay_score);
          if (Math.abs(decayDiff) > 0.0001) return decayDiff;
          return new Date(b.accessed_at) - new Date(a.accessed_at);
        });

        const limit = args.limit || 10;
        const results = memories.slice(0, limit);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                success: true, 
                memories: results, 
                count: results.length 
              }, null, 2),
            },
          ],
        };
      }

      case 'merge_memories': {
        const memoriesToMerge = index.memories.filter(m => 
          args.memory_ids.includes(m.id)
        );

        if (memoriesToMerge.length < 2) {
          throw new Error('At least 2 memories required for merge');
        }

        const mergedMemory = {
          id: `mem-${crypto.randomUUID()}`,
          type: memoriesToMerge[0].type,
          category: memoriesToMerge[0].category,
          content: args.merged_content,
          tags: [...new Set(memoriesToMerge.flatMap(m => m.tags))],
          importance: Math.max(...memoriesToMerge.map(m => m.importance)),
          created_at: memoriesToMerge.sort((a, b) => 
            new Date(a.created_at) - new Date(b.created_at)
          )[0].created_at,
          accessed_at: new Date().toISOString(),
          access_count: memoriesToMerge.reduce((sum, m) => sum + m.access_count, 0),
          decay_score: '1.0000',
          related_ids: args.memory_ids,
        };

        // Remove old memories
        index.memories = index.memories.filter(m => !args.memory_ids.includes(m.id));
        
        // Add merged memory
        index.memories.push(mergedMemory);
        
        await saveIndex(index);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, memory: mergedMemory }, null, 2),
            },
          ],
        };
      }

      case 'decay_old_memories': {
        const threshold = args.min_decay_score || 0.01;
        const action = args.action || 'archive';

        // Update decay scores
        index.memories.forEach(memory => {
          memory.decay_score = calculateDecayScore(memory);
        });

        const lowValueMemories = index.memories.filter(m => 
          parseFloat(m.decay_score) < threshold
        );

        if (action === 'archive') {
          // Move to archive
          const archiveFile = path.join(MEMORY_DIR, `archive-${Date.now()}.json`);
          await fs.writeFile(archiveFile, JSON.stringify(lowValueMemories, null, 2));
          
          // Remove from active index
          index.memories = index.memories.filter(m => 
            parseFloat(m.decay_score) >= threshold
          );
        } else {
          // Delete
          index.memories = index.memories.filter(m => 
            parseFloat(m.decay_score) >= threshold
          );
        }

        await saveIndex(index);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                success: true, 
                processed: lowValueMemories.length,
                action 
              }, null, 2),
            },
          ],
        };
      }

      case 'list_categories': {
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ 
                success: true, 
                categories: index.categories 
              }, null, 2),
            },
          ],
        };
      }

      case 'update_memory_access': {
        const memory = index.memories.find(m => m.id === args.id);
        
        if (!memory) {
          throw new Error(`Memory ${args.id} not found`);
        }

        memory.accessed_at = new Date().toISOString();
        memory.access_count++;
        memory.decay_score = calculateDecayScore(memory);
        
        await saveIndex(index);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, memory }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ success: false, error: error.message }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Memory Manager MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

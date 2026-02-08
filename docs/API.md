# API Reference - Proactive AI Assistant

## Task Queue MCP Server

### create_task

Create a new task in the queue.

**Parameters:**
```json
{
  "description": "string (required)",
  "priority": "low|medium|high|critical (required)",
  "category": "automation|research|communication|development (required)",
  "due_date": "ISO-8601 string (optional)",
  "dependencies": ["task-id"] (optional)
}
```

**Returns:**
```json
{
  "success": true,
  "task": {
    "id": "task-1234567890-abc123",
    "description": "Task description",
    "priority": "high",
    "category": "automation",
    "status": "pending",
    "created_at": "2025-02-08T14:00:00.000Z"
  }
}
```

### get_next_task

Get the next pending task based on priority and dependencies.

**Parameters:**
```json
{
  "category": "automation (optional)"
}
```

**Returns:**
```json
{
  "success": true,
  "task": { ... }
}
```

### update_task_status

Update task status.

**Parameters:**
```json
{
  "id": "task-id (required)",
  "status": "pending|in_progress|completed|failed (required)",
  "result": "string (optional)"
}
```

### list_tasks

List tasks by status.

**Parameters:**
```json
{
  "status": "pending|in_progress|completed|failed|all",
  "category": "string"
}
```

### delete_task

Delete a task.

**Parameters:**
```json
{
  "id": "task-id (required)"
}
```

## Memory Manager MCP Server

### store_memory

Store a new memory with temporal metadata.

**Parameters:**
```json
{
  "type": "preference|skill|pattern|decision|fact|interaction",
  "category": "string",
  "content": "string",
  "tags": ["tag1", "tag2"],
  "importance": 1-10
}
```

**Returns:**
```json
{
  "success": true,
  "memory": {
    "id": "mem-uuid",
    "type": "preference",
    "category": "coding",
    "content": "Prefers TypeScript over JavaScript",
    "tags": ["typescript", "coding"],
    "importance": 7,
    "created_at": "2025-02-08T14:00:00.000Z",
    "decay_score": "1.0000"
  }
}
```

### retrieve_memory

Retrieve memories by query, category, or relevance.

**Parameters:**
```json
{
  "query": "search string",
  "category": "string",
  "type": "preference",
  "tags": ["tag1"],
  "limit": 10,
  "min_decay_score": 0.1
}
```

### merge_memories

Merge related memories.

**Parameters:**
```json
{
  "memory_ids": ["mem-id-1", "mem-id-2"],
  "merged_content": "Consolidated content"
}
```

### decay_old_memories

Archive or delete low-value memories.

**Parameters:**
```json
{
  "min_decay_score": 0.01,
  "action": "archive|delete"
}
```

## Usage Examples

### Creating a Task

```javascript
// Via Claude Code
"Create a high-priority automation task to check system status"
```

### Storing a Memory

```javascript
// Via Claude Code
"Remember that I prefer TypeScript for all new projects"
```

### Retrieving Memories

```javascript
// Via Claude Code
"What do you know about my coding preferences?"
```

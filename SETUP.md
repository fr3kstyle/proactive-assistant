# Setup Guide - Proactive AI Assistant

## Prerequisites

- Node.js 18+ installed
- Claude Code CLI installed
- GitHub CLI installed and authenticated

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/fr3kstyle/proactive-assistant.git
cd proactive-assistant
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up MCP Servers

```bash
npm run setup:mcp
```

This configures the task queue and memory manager MCP servers in `~/.claude/mcp.json`.

### 4. Configure Subagents

```bash
npm run setup:agents
```

This copies agent configurations to `~/.claude/agents/`.

### 5. Set Up Cron Jobs (Optional)

For automated task processing:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Task queue worker - every 10 minutes
*/10 * * * * npm run worker >> ~/.claude/logs/worker-cron.log 2>&1

# Daily brief - 8 AM
0 8 * * * cd /home/fr3k/proactive-assistant && npm run daily-brief >> ~/.claude/logs/daily-brief.log 2>&1
```

## Usage

### Creating Tasks

Tasks can be created via the MCP server:

```javascript
// Use via Claude Code
// "Create a high-priority task for research: Investigate X"
```

### Managing Tasks

```bash
# List all tasks (via Claude Code)
# "Show me all pending tasks"

# Update task status
# "Mark task task-xxx as completed"
```

### Memory Operations

```bash
# Store memory
# "Remember that I prefer TypeScript over JavaScript"

# Retrieve memories
# "What do you know about my coding preferences?"
```

## Architecture

```
┌─────────────────────────────────────────┐
│          Claude Code CLI                │
│  (Orchestration & Intelligence)         │
└─────────────────────────────────────────┘
              ↓              ↓              ↓
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │  Task Queue  │  │ Memory Mgr   │  │  Subagents   │
    │   MCP Server │  │  MCP Server  │  │ (Automation, │
    │              │  │              │  │  Researcher, │
    └──────────────┘  └──────────────┘  │  Communicator│
                                       │  Developer)  │
                                       └──────────────┘
```

## Components

### MCP Servers

1. **task-queue**: Task scheduling and management
2. **memory-manager**: Long-term memory with temporal tracking

### Subagents

1. **automation**: Task execution and monitoring
2. **researcher**: Continuous learning and research
3. **communicator**: Message and notification management
4. **developer**: Code quality and documentation

### Workers

1. **task-queue-worker**: Processes tasks from queue
2. **daily-brief**: Generates daily summaries

## Troubleshooting

### MCP Servers Not Working

Check that `~/.claude/mcp.json` exists and contains correct paths.

### Agents Not Found

Run `npm run setup:agents` to copy agent configurations.

### Worker Not Executing

Check logs: `~/.claude/logs/worker.log`

## Next Steps

1. Create your first task via Claude Code
2. Store important preferences in memory
3. Set up cron jobs for automation
4. Customize agent behaviors

## Support

For issues, visit: https://github.com/fr3kstyle/proactive-assistant

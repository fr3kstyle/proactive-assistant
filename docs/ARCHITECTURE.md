# Architecture - Proactive AI Assistant

## System Overview

The Proactive AI Assistant is built on Claude Code's native capabilities with custom MCP servers for enhanced functionality.

## Key Components

### 1. Claude Code Core
- **Subagents**: automation, researcher, communicator, developer
- **Hooks**: SubagentStart, SubagentStop, PreToolUse, PostToolUse
- **Memory**: user, project, local scopes

### 2. MCP Servers
- **Task Queue**: Scheduling, priorities, dependencies
- **Memory Manager**: Learning, retrieval, temporal tracking

### 3. Workers
- **Task Queue Worker**: Processes tasks from queue
- **Daily Brief**: Generates summaries

## Data Flow

```
User → Worker → Task Queue MCP → Claude Code → Subagent → Execute → Update Status
```

## Documentation

See SETUP.md for installation guide.

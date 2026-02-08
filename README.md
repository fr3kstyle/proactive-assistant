# Proactive AI Assistant

An autonomous AI assistant powered by Claude Code, featuring task automation, long-term memory, and multi-platform integration.

## Features

- **Fully Autonomous**: Executes tasks independently with intelligent escalation
- **Long-term Memory**: Learns from interactions across sessions
- **Task Queue**: Scheduled and asynchronous task processing
- **Platform Integration**: GitHub, Telegram, WhatsApp, Slack, Discord
- **Proactive Monitoring**: Background observation and pattern detection
- **Safe Exploration**: Automatic checkpoints and rollback

## Architecture

```
Frontend (Terminal/Messaging/Web) → Claude Code Core → MCP Servers → Memory Layer
```

## Components

- **MCP Servers**: Task queue, memory manager, platform bridges
- **Subagents**: Specialized workers for automation, research, communication, development
- **Workers**: Cron-based background processors
- **Memory**: Temporal, persistent learning system

## Installation

```bash
# Clone repository
git clone https://github.com/fr3kstyle/proactive-assistant.git
cd proactive-assistant

# Install dependencies
npm install

# Set up MCP servers
npm run setup:mcp

# Configure subagents
npm run setup:agents
```

## Usage

```bash
# Start worker
npm run worker

# Create task
npm run task:create "Task description"

# List tasks
npm run task:list

# View memory
npm run memory:query
```

## Configuration

See `.claude/` directory for subagent configurations and `mcp-servers/` for MCP server implementations.

## License

MIT

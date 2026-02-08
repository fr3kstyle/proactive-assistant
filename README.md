# 🤖 Proactive AI Assistant

> An autonomous AI assistant powered by Claude Code with task automation, long-term memory, and multi-platform integration.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Native-blue.svg)](https://claude.com/claude-code)

## ✨ Features

- **🔄 Fully Autonomous** - Executes tasks independently with intelligent escalation
- **🧠 Long-term Memory** - Learns from interactions across sessions with temporal tracking
- **📋 Task Queue** - Priority-based scheduling with dependency management
- **🤝 Multi-Platform** - GitHub, Telegram, WhatsApp, Slack, Discord integration
- **🔍 Proactive Monitoring** - Background observation and pattern detection
- **🛡️ Safe Exploration** - Automatic checkpoints and rollback capabilities

## 🚀 Quick Start

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

# Start worker
npm run worker
```

## 📖 Documentation

- [Setup Guide](SETUP.md) - Complete installation instructions
- [Architecture](docs/ARCHITECTURE.md) - System design and components
- [API Reference](docs/API.md) - MCP server APIs
- [Usage Examples](examples/basic-usage.md) - Common tasks and workflows
- [Contributing](CONTRIBUTING.md) - How to contribute

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    Claude Code Core                       │
│  • Subagents: automation, researcher, communicator, dev   │
│  • Hooks: Automation triggers                             │
│  • Memory: Persistent learning across sessions            │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    MCP Servers                            │
│  • Task Queue: Scheduling, priorities, dependencies       │
│  • Memory Manager: Learning, retrieval, temporal tracking │
└──────────────────────────────────────────────────────────┘
                          ↓
┌──────────────────────────────────────────────────────────┐
│                    Data Storage                           │
│  • ~/.claude/tasks.json                                  │
│  • ~/.claude/memory/index.json                           │
└──────────────────────────────────────────────────────────┘
```

## 💡 Usage

### Creating Tasks

```
Create a high-priority automation task to check system status
```

### Storing Memories

```
Remember that I prefer TypeScript for all new projects
```

### Using Agents

```
/agent:automation Monitor all running services
/agent:researcher Investigate the latest React features
/agent:communicator Draft a response to the project email
/agent:developer Review code in src/utils and add comments
```

## 📦 Components

### MCP Servers

- **task-queue**: Priority-based task scheduling
- **memory-manager**: Temporal memory with decay scoring

### Subagents

- **automation**: Task execution and monitoring
- **researcher**: Continuous learning and research
- **communicator**: Message and notification management
- **developer**: Code quality and documentation

### Workers

- **task-queue-worker**: Processes tasks from queue
- **daily-brief**: Generates daily summaries

## 🔧 Configuration

MCP servers are configured in `~/.claude/mcp.json`:

```json
{
  "mcpServers": {
    "task-queue": {
      "command": "node",
      "args": ["/path/to/mcp-servers/task-queue/index.js"]
    },
    "memory-manager": {
      "command": "node",
      "args": ["/path/to/mcp-servers/memory-manager/index.js"]
    }
  }
}
```

## 📅 Automation

Set up cron jobs for automated task processing:

```bash
# Process tasks every 10 minutes
*/10 * * * * npm run worker >> ~/.claude/logs/worker-cron.log 2>&1

# Daily brief at 8 AM
0 8 * * * npm run daily-brief >> ~/.claude/logs/daily-brief.log 2>&1
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run setup
npm run setup:mcp
npm run setup:agents

# Test MCP servers
node mcp-servers/task-queue/index.js

# Run worker
npm run worker

# Generate daily brief
npm run daily-brief
```

## 🔍 Troubleshooting

### MCP Servers Not Working

Check that `~/.claude/mcp.json` exists and contains correct paths.

### Agents Not Found

Run `npm run setup:agents` to reinstall agent configurations.

### Worker Not Executing

Check logs: `~/.claude/logs/worker.log`

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

Built with:
- [Claude Code](https://claude.com/claude-code) - AI-powered CLI
- [Model Context Protocol](https://modelcontextprotocol.io/) - Server integration
- [Node.js](https://nodejs.org/) - Runtime environment

## 📮 Support

- 📧 Issues: [GitHub Issues](https://github.com/fr3kstyle/proactive-assistant/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/fr3kstyle/proactive-assistant/discussions)
- 📚 Docs: [Wiki](https://github.com/fr3kstyle/proactive-assistant/wiki)

---

**Made with ❤️ by [fr3kstyle](https://github.com/fr3kstyle)**

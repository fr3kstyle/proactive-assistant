# Quick Start Guide

Get your Proactive AI Assistant up and running in 5 minutes!

## Prerequisites Check

```bash
# Check Node.js (need 18+)
node --version

# Check Claude Code
claude --version

# Check GitHub CLI
gh --version
```

## Installation

### 1. Clone and Install (30 seconds)

```bash
git clone https://github.com/fr3kstyle/proactive-assistant.git
cd proactive-assistant
npm install
```

### 2. Configure (1 minute)

```bash
# Set up MCP servers
npm run setup:mcp

# Configure subagents
npm run setup:agents
```

### 3. Verify (30 seconds)

```bash
# Check MCP config
cat ~/.claude/mcp.json

# Check agents
ls ~/.claude/agents/ | grep -E "automation|researcher|communicator|developer"
```

## First Use

### Create Your First Task

```
Create a medium-priority task to learn how the proactive assistant works
```

### Store Your First Memory

```
Remember that I'm setting up the proactive assistant for the first time
```

### Use an Agent

```
/agent:automation Show me the system status
```

## Set Up Automation (Optional)

### Cron Jobs

```bash
# Edit crontab
crontab -e

# Add these lines:
# Process tasks every 10 minutes
*/10 * * * * npm run worker >> ~/.claude/logs/worker-cron.log 2>&1

# Daily brief at 8 AM
0 8 * * * cd /home/fr3k/proactive-assistant && npm run daily-brief >> ~/.claude/logs/daily-brief.log 2>&1
```

## Verify Everything Works

### Test Task Queue

```bash
# Run worker manually
npm run worker

# Check logs
tail -f ~/.claude/logs/worker.log
```

### Test Memory

```bash
# Check memory file
cat ~/.claude/memory/index.json | jq '.memories | length'
```

## Common Commands

```bash
# Process tasks
npm run worker

# Daily brief
npm run daily-brief

# Reconfigure MCP servers
npm run setup:mcp

# Reinstall agents
npm run setup:agents

# Check logs
tail -f ~/.claude/logs/worker.log
```

## Troubleshooting

### "command not found: claude"
Install Claude Code CLI from: https://claude.com/claude-code

### "MCP servers not working"
```bash
npm run setup:mcp
cat ~/.claude/mcp.json
```

### "Agents not found"
```bash
npm run setup:agents
ls ~/.claude/agents/
```

### "Worker not executing"
```bash
# Check logs
tail -f ~/.claude/logs/worker.log

# Test MCP server
node mcp-servers/task-queue/index.js
```

## Next Steps

1. Read [SETUP.md](SETUP.md) for detailed configuration
2. Check [examples/basic-usage.md](examples/basic-usage.md) for usage examples
3. Review [docs/API.md](docs/API.md) for API reference
4. Set up cron jobs for automation
5. Customize agent behaviors

## Get Help

- 📖 [Documentation](SETUP.md)
- 💬 [GitHub Issues](https://github.com/fr3kstyle/proactive-assistant/issues)
- 📚 [Examples](examples/basic-usage.md)

---

**You're ready to go!** 🚀 Start by creating a task or storing a memory.

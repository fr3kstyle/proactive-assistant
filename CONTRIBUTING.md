# Contributing - Proactive AI Assistant

Thank you for your interest in contributing!

## Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/proactive-assistant.git`
3. Install dependencies: `npm install`
4. Run setup: `npm run setup:mcp && npm run setup:agents`

## Development

### Adding MCP Servers

1. Create directory: `mcp-servers/your-server/`
2. Create `package.json` and `index.js`
3. Implement stdio transport
4. Add tools with JSON schemas
5. Update `scripts/setup-mcp.js`
6. Test locally
7. Submit PR

### Adding Subagents

1. Create `.claude/agents/your-agent.md`
2. Define purpose, hooks, memory scope
3. Add to setup script
4. Test with Claude Code
5. Submit PR

### Adding Workers

1. Create `workers/your-worker.js`
2. Use MCP tools for data access
3. Implement error handling
4. Add logging
5. Update package.json scripts
6. Submit PR

## Testing

```bash
# Test MCP servers
node mcp-servers/task-queue/index.js

# Test workers
npm run worker

# Test setup
npm run setup:mcp && npm run setup:agents
```

## Commit Guidelines

- Use clear, descriptive messages
- Reference issues: `Fixes #123`
- Sign commits: `-s`

## Code Style

- Use ES6+ features
- Follow existing patterns
- Add comments for complex logic
- Document APIs

## Pull Requests

1. Describe your changes
2. Reference related issues
3. Add tests if applicable
4. Update documentation
5. Ensure CI passes

## Questions?

Open an issue for discussion.

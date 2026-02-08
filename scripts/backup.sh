#!/bin/bash

# Backup script for Proactive Assistant data

BACKUP_DIR="$HOME/.claude/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.tar.gz"

echo "📦 Creating backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Create backup
tar -czf "$BACKUP_FILE" \
  ~/.claude/tasks.json \
  ~/.claude/memory/ \
  ~/.claude/logs/ \
  ~/.claude/mcp.json \
  ~/proactive-assistant/.claude/agents/ 2>/dev/null

# Check if backup was successful
if [ $? -eq 0 ]; then
  echo "✅ Backup created: $BACKUP_FILE"
  
  # Show backup size
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "   Size: $SIZE"
  
  # List backups (keep last 5)
  echo ""
  echo "📚 Recent backups:"
  ls -lh "$BACKUP_DIR" | tail -5
else
  echo "❌ Backup failed"
  exit 1
fi

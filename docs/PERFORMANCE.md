# Performance Guide

## System Performance

### Current Metrics

- **Task Processing**: ~100ms per task
- **Memory Retrieval**: ~50ms per query
- **Test Success Rate**: 90% (9/10 tests passing)
- **Memory Efficiency**: ~1KB per memory
- **Task Efficiency**: ~500B per task

### Optimization Tips

1. **Memory Management**
   - Run cleanup weekly: `npm run cleanup`
   - Export data monthly: `npm run export`
   - Backup daily: `npm run backup`

2. **Task Optimization**
   - Keep pending tasks < 100
   - Use appropriate priorities
   - Set dependencies correctly

3. **Monitoring**
   - Check stats daily: `npm run monitor`
   - Review logs weekly
   - Test system monthly: `npm run test:all`

## Benchmarks

### Task Queue Operations
- Create task: ~10ms
- Update task: ~5ms
- Get next task: ~15ms
- List tasks: ~20ms

### Memory Operations
- Store memory: ~10ms
- Retrieve memory: ~15ms
- Update access: ~5ms
- Decay calculation: ~2ms per memory

### Worker Performance
- Task execution: ~1000ms (includes 1s delay for demo)
- Log write: ~5ms
- Status update: ~10ms

## Scaling

### Current Limits
- Tasks: Unlimited (JSON file)
- Memories: Unlimited (JSON file)
- Log size: 1000 lines (auto-rotates)
- Concurrent workers: 1 (can be increased)

### Future Scaling
- Database backend (PostgreSQL/MongoDB)
- Redis for caching
- Multi-worker support
- Distributed task queue

## Maintenance

### Daily
- Monitor system stats
- Check for failed tasks

### Weekly
- Run cleanup script
- Review decayed memories
- Check disk space

### Monthly
- Export all data
- Full backup
- Performance review
- Update dependencies

## Troubleshooting Performance

### Slow Task Processing
1. Check disk space
2. Review task count
3. Verify JSON validity
4. Check log size

### High Memory Usage
1. Run cleanup script
2. Archive old memories
3. Export and clear old data

### Worker Failures
1. Check logs: `~/.claude/logs/worker.log`
2. Verify MCP servers running
3. Test task queue
4. Restart worker

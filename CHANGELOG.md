# Changelog

## [1.2.0] - 2025-02-08

### Added
- **Data Export**: Export tasks and memories to JSON files
- **Cleanup Script**: Automatic cleanup of old tasks and decayed memories
- **Backup Script**: Shell script for backing up all data
- **Log Rotation**: Automatic log file rotation
- **Memory Decay**: Automatic decay score calculation
- **Enhanced Monitoring**: System statistics dashboard

### Improved
- Better data management utilities
- Enhanced export functionality
- Improved cleanup operations
- Better backup handling

### New Commands
- `npm run cleanup` - Clean old tasks and decay memories
- `npm run export` - Export data to JSON files
- `npm run backup` - Backup all assistant data
- `npm run test:all` - Run all tests

## [1.1.0] - 2025-02-08

### Added
- Comprehensive test suite with 10 tests (100% pass rate)
- Improved worker script with better error handling
- System monitoring script (`npm run monitor`)
- Memory decay score calculation
- Task dependency validation
- Enhanced logging with timestamps

### Improved
- Better error handling in worker
- More reliable task execution
- Enhanced memory tracking
- Improved log format

## [1.0.0] - 2025-02-08

### Initial Release
- Task Queue MCP server with priority scheduling
- Memory Manager MCP server with temporal tracking
- 4 specialized subagents
- Worker scripts for automation
- Setup scripts and documentation

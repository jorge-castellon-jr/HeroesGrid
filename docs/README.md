# HeroesGrid Documentation

This directory contains all project documentation, organized by status and purpose.

## Structure

### 📁 `/completed/` - Completed Tasks
Task files where all checkboxes are marked as complete. These represent finished features and migrations.

**Files (10):**
- ADMIN_MODE.md - Admin mode feature implementation
- CONVERSION_NOTES.md - Vue to React conversion
- CUSTOM_RANGER_TASKS.md - Custom ranger enhancement tasks
- IMPLEMENTATION_COMPLETE.md - Custom ranger feature completion summary
- PRINT_TO_PLAY.md - Print-to-play feature documentation
- SYNC_QUICKSTART.md - PWA sync quick start guide
- SYNC_SYSTEM.md - PWA sync system documentation
- TEAM_POSITION_UPDATE.md - Team position migration
- TESTING_OFFLINE.md - Offline testing guide
- WATERMELONDB_MIGRATION.md - Database migration from sql.js

### 📁 `/in-progress/` - Active Tasks
Task files with uncompleted checkboxes. These are current or planned work items.

**Files (2):**
- HOTG_BATTLE_MIGRATION.md - Battle phase migration plan (planning phase)
- TURBOREPO_MIGRATION_PLAN.md - Monorepo migration (Phase 5+ pending)

### 📁 `/information/` - Reference Documentation
General documentation, architecture plans, user guides, and reference materials.

**Files (12):**
- CUSTOM_RANGER_USER_GUIDE.md - User guide for custom rangers
- custom-ranger-enhancement-plan.md - Technical design for custom ranger feature
- DATA_COMPARISON.md - Payload schema vs site requirements
- DATABASE_PLAN.md - Database architecture document
- PACKAGE_VERSIONS.md - Package version tracking
- PAYLOAD_SCHEMA_ANALYSIS.md - Payload CMS schema analysis
- QUERYING_LOCAL_DATA.md - Local data querying guide
- README_FEATURE_UPDATE.md - Feature announcement for custom rangers
- TEST_RESULTS.md - Test results summary
- TURSO_TO_WATERMELONDB_MIGRATION.md - Migration notes
- WATERMELONDB_SCHEMA.md - WatermelonDB schema documentation
- YARN_CONFIG.md - Yarn configuration notes

### 📄 `AI_RULES.md` - AI Assistant Guidelines
Rules and conventions for AI assistants working on this project. **Read this first!**

## Quick Links

### For Development
- [AI Rules](./AI_RULES.md) - Start here for project conventions
- [Database Plan](./information/DATABASE_PLAN.md) - Architecture overview
- [Custom Ranger User Guide](./information/CUSTOM_RANGER_USER_GUIDE.md) - Feature documentation

### For New Features
1. Create task file in `/in-progress/`
2. Follow patterns in [AI Rules](./AI_RULES.md)
3. Mark checkboxes as you complete tasks
4. Move to `/completed/` when done

### For Reference
- Check `/information/` for architecture docs
- Check `/completed/` for implementation examples
- Check `/in-progress/` for current work

## File Organization Rules

1. **Task files** (with checkboxes):
   - Start in `/in-progress/`
   - Move to `/completed/` when all tasks are done

2. **Informational docs** (no tasks):
   - Always in `/information/`
   - User guides, architecture, references

3. **AI Rules**:
   - Keep in root of `docs/`
   - Update as patterns emerge

## Statistics

- **Total Documentation Files**: 25
- **Completed Tasks**: 10
- **In Progress**: 2
- **Reference Docs**: 12
- **AI Guidelines**: 1

---

**Last Updated**: 2025-01-17  
**Organization Structure**: v1.0

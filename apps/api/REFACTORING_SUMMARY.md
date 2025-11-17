# API Refactoring Summary: User Content Only

**Date:** 2025-01-17  
**Reason:** Clarification that D1 should only store user-created content, not official game data

## Changes Made

### Architecture Decision

**Before:** D1 database would store all game data (rangers, teams, expansions, etc.) plus user content.

**After:** D1 database only stores user-created content and authentication data. Official game data stays in the web app's local WatermelonDB (IndexedDB).

### Why This Approach?

1. **Offline-First:** Game data works without internet connection
2. **Performance:** Local IndexedDB access is instant
3. **Simplicity:** No need to seed/maintain game data in the cloud
4. **Cost-Effective:** Minimal cloud storage requirements
5. **Scalability:** Official data doesn't consume user quotas

## Schema Changes

### Removed Tables (12 tables)
- ❌ rulebooks
- ❌ seasons
- ❌ expansions
- ❌ teams
- ❌ rangers (official)
- ❌ enemies
- ❌ zords
- ❌ megazords
- ❌ ranger_cards
- ❌ arsenal_cards
- ❌ tags
- ❌ locations

### Added Tables (5 tables)
- ✅ users - Authentication and profile
- ✅ sessions - Auth tokens
- ✅ user_settings - User preferences
- ✅ custom_rangers - User-created rangers
- ✅ custom_ranger_likes - Like tracking

## API Changes

### Removed Router
- ❌ `gameData` router with official game data queries

### Added Router
- ✅ `customRangers` router with user content CRUD

### New Endpoints

**Queries:**
- `customRangers.getPublished()` - Community page data
- `customRangers.getById()` - Single ranger with view tracking
- `customRangers.getByUserSlug()` - User's ranger by slug
- `customRangers.getMyRangers()` - All user's rangers

**Mutations:**
- `customRangers.create()` - Create custom ranger
- `customRangers.update()` - Update custom ranger
- `customRangers.delete()` - Delete custom ranger

## Migration Changes

### Old Migration
- File: `0000_gorgeous_quicksilver.sql`
- Tables: 12 (all game data)
- Size: ~160 lines

### New Migration
- File: `0000_fantastic_franklin_storm.sql`
- Tables: 5 (user content only)
- Size: ~80 lines
- Foreign keys with cascade delete
- Proper indexes for queries

## File Changes

### Renamed
- `src/routers/gameData.ts` → `src/routers/customRangers.ts`

### Modified
- `src/db/schema.ts` - Complete rewrite with user-focused tables
- `src/router.ts` - Updated to use customRangers router
- `README.md` - Updated architecture documentation
- `DEPLOYMENT_STATUS.md` - Updated endpoints and schema info
- `docs/in-progress/TURBOREPO_MIGRATION_PLAN.md` - Added architecture note

## Data Flow

### Official Game Data
```
Browser → WatermelonDB (IndexedDB) → Local queries
- Instant access
- Offline-capable
- No API calls needed
```

### User-Created Content
```
Browser → tRPC API → Cloudflare Worker → D1 Database
- Cloud sync
- Community sharing
- Cross-device access
```

## Phase 6 Implications

Authentication system (Phase 6) will now focus on:
- ✅ Discord OAuth for users table
- ✅ Session management for sessions table
- ✅ Protected mutations for custom_rangers
- ✅ User context in tRPC procedures

No changes needed for game data since it's already local-first.

## Testing Checklist

- [x] TypeScript compilation passes
- [x] New migration generated successfully
- [x] Schema has proper foreign keys and indexes
- [x] Router exports correct types
- [ ] Dev server starts (pending migration apply)
- [ ] CRUD operations work (after deployment)
- [ ] View/like counters work properly

## Benefits

1. **Reduced Complexity:** No need to manage game data seeding/updates
2. **Better UX:** Game data always available offline
3. **Lower Costs:** Minimal D1 storage usage
4. **Faster Queries:** No round-trip to D1 for game data
5. **Clearer Separation:** User content vs official content

## Next Steps

1. Apply new migration to D1 database
2. Deploy API with user-content-only schema
3. Implement Phase 6 authentication
4. Build sync functionality for custom rangers
5. Create community page for published rangers

---

**Migration Status:** Complete  
**Ready for Deployment:** Yes  
**Breaking Changes:** None (new API, no existing data)

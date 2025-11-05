# HeroesGrid Database Architecture & Plan

## Overview

This document outlines the database strategy for HeroesGrid React app, focusing on a serverless, browser-based approach with future Cloudflare D1 sync capabilities.

## Current Implementation ✅

### WatermelonDB (All Content)

**Status**: ✅ Migrated from sql.js to WatermelonDB

**Purpose**: Store and serve static game content that doesn't change

**Location**: `/public/data/content.db`

**Content Stored**:
- ✅ Rulebooks (Official Rulebook, FAQ)
- 🔄 Rangers (to be added)
- 🔄 Enemies (to be added)
- 🔄 Teams (to be added)
- 🔄 Expansion data (to be added)

**Implementation**:
- Uses `sql.js` library (WebAssembly SQLite)
- Database file served as static asset
- Loaded once in browser, queries run client-side
- Zero backend required

**Build Process**:
```bash
yarn build:db  # Converts markdown content to SQLite database
```

**Usage**:
```javascript
import { initDatabase, getAllRulebooks, getRulebookBySlug } from '../lib/sqlite';

// Initialize once
await initDatabase('/data/content.db');

// Query data
const rulebooks = getAllRulebooks();
const rulebook = getRulebookBySlug('official-rulebook');
```

**Files**:
- `src/lib/sqlite.js` - Database utilities
- `scripts/build-db.js` - Build script to convert MD → SQLite
- `public/data/content.db` - Generated database file

## Planned Implementation 🔄

### IndexedDB (User-Created Content)

**Status**: 🔄 To be implemented

**Purpose**: Store user-created and customized data locally

**Content to Store**:
- Custom Rangers created by users
- Favorites/bookmarks
- User preferences/settings
- Game state/progress
- Campaign data
- Custom decks/loadouts

**Why IndexedDB**:
- ✅ Built into browsers
- ✅ Larger storage capacity (50MB+)
- ✅ Structured data with indexes
- ✅ Async API (won't block UI)
- ✅ Easy to sync to server later

**Proposed Structure**:
```javascript
// Object Stores
- customRangers
  - id (key)
  - name
  - color
  - abilities
  - deck
  - createdAt
  - updatedAt

- favorites
  - id (key)
  - type (ranger/enemy/rulebook)
  - itemId
  - addedAt

- userSettings
  - key
  - value

- campaigns
  - id (key)
  - name
  - progress
  - rangers
  - date
```

**Libraries to Consider**:
- `idb` - Promise-based wrapper for IndexedDB (simple, 1KB)
- `dexie` - Full-featured IndexedDB wrapper (more powerful, 20KB)
- `localforage` - localStorage-like API with IndexedDB backend

**Recommended**: Use `idb` for simplicity

## Future Implementation 🚀

### Cloudflare D1 Integration

**Status**: 🚀 Future feature (when user accounts are added)

**Purpose**: Sync user data across devices and enable multi-user features

**When to Implement**:
- User authentication is added
- Cross-device sync is needed
- Multiplayer features required
- Data backup/restore needed

**Architecture**:
```
Browser                          Cloudflare
┌──────────────────────┐        ┌───────────────┐
│                      │        │               │
│  IndexedDB (local)   │◄──────►│  D1 Database  │
│                      │  Sync  │               │
│  • Custom Rangers    │        │  • Users      │
│  • Favorites         │        │  • Rangers    │
│  • Settings          │        │  • Campaigns  │
│                      │        │               │
└──────────────────────┘        └───────────────┘
```

**Sync Strategy**:
1. User logs in → Pull latest data from D1 to IndexedDB
2. User makes changes → Write to IndexedDB immediately
3. Background sync → Push changes to D1 when online
4. Conflict resolution → Last-write-wins or version-based

**Cloudflare Workers API**:
```javascript
// Example endpoint
POST /api/rangers
GET /api/rangers/:id
PUT /api/rangers/:id
DELETE /api/rangers/:id
```

## Data Flow

### Current (Read-Only Content)
```
Markdown Files → Build Script → SQLite DB → Browser (sql.js) → React Components
```

### Future (User Content)
```
User Input → React Components → IndexedDB → (Later) Cloudflare D1
```

## Implementation Checklist

### Phase 1: Complete SQLite Setup ✅
- [x] Set up sql.js
- [x] Create build script for rulebooks
- [x] Implement rulebook pages
- [ ] Add all game content tables:
  - [ ] Rangers
  - [ ] Enemies  
  - [ ] Teams
  - [ ] Expansions
  - [ ] Zords
  - [ ] Monsters
  - [ ] Bosses

### Phase 2: IndexedDB for User Data 🔄
- [ ] Install `idb` library
- [ ] Create IndexedDB schema
- [ ] Create database utilities
- [ ] Implement custom ranger creation
- [ ] Add favorites system
- [ ] Add user settings storage
- [ ] Implement data export/import (JSON backup)

### Phase 3: Cloudflare D1 Sync 🚀
- [ ] Set up Cloudflare Workers
- [ ] Create D1 database
- [ ] Implement authentication (Clerk/Auth.js)
- [ ] Build sync API endpoints
- [ ] Implement sync logic
- [ ] Add conflict resolution
- [ ] Add offline indicator
- [ ] Test multi-device sync

## Technical Decisions

### Why sql.js over WatermelonDB?
- **sql.js**: Perfect for read-only static content, simple setup, already implemented
- **WatermelonDB**: Overkill for our use case, designed for complex reactive data and offline-first apps with frequent updates

### Why IndexedDB over LocalStorage?
- **IndexedDB**: Structured data, 50MB+ storage, async, better for complex objects
- **LocalStorage**: 5-10MB limit, synchronous (blocks UI), only stores strings

### Why Not a Backend Server?
- Project goal is serverless/browser-based
- Reduces complexity and hosting costs
- Better performance (local data access)
- Works offline by default
- Only need backend for multi-device sync

## File Organization

```
react-web/
├── docs/
│   ├── DATABASE_PLAN.md (this file)
│   ├── CONVERSION_NOTES.md
│   └── ...other docs
├── scripts/
│   └── build-db.js
├── src/
│   ├── lib/
│   │   ├── sqlite.js (read-only content)
│   │   └── indexedDB.js (future: user content)
│   └── ...
├── content/
│   └── rulebooks/
│       ├── official-rulebook.md
│       └── faq.md
└── public/
    └── data/
        └── content.db
```

## Performance Considerations

### SQLite (sql.js)
- **Load Time**: ~1-2 seconds for initial DB load (one-time per session)
- **Query Speed**: Near-instant for typical queries
- **Memory**: Entire DB loaded into memory (acceptable for <10MB)
- **Optimization**: Lazy load DB only when needed, cache in memory

### IndexedDB
- **Write Speed**: Fast asynchronous writes
- **Read Speed**: Fast indexed reads
- **Storage**: 50MB+ depending on browser
- **Optimization**: Index frequently queried fields

## Security Notes

- SQLite DB is public (anyone can download it) - this is fine for game content
- IndexedDB is per-domain, per-user - cannot be accessed by other sites
- Cloudflare D1 will require authentication and proper API security
- Never store sensitive data in browser storage unencrypted

## Next Steps

1. ✅ Complete rulebook implementation
2. Expand SQLite schema to include all game content
3. Build script to import ranger/enemy/team data
4. Set up IndexedDB utilities
5. Implement custom ranger creator
6. Plan Cloudflare D1 migration path

---

Last Updated: 2025-11-05

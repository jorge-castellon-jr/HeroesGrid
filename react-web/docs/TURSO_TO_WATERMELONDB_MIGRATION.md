# Turso/Payload CMS to WatermelonDB Migration Plan

## Overview
Migrate all official Power Rangers data from Turso database (originally from Payload CMS) to WatermelonDB for 100% local-first operation in the React app.

---

## Goals
- ✅ Export all official source data from Turso database
- ✅ Exclude Payload CMS-specific metadata and user-created content
- ✅ Create complete WatermelonDB schema for all entities
- ✅ Seed WatermelonDB with all official data
- ✅ Replace all Sanity API calls with WatermelonDB queries
- ✅ Remove Sanity dependencies
- ✅ Document any missing data fields

---

## Phase 1: Data Analysis & Schema Discovery

### Tasks
- [x] **1.1** Locate Payload CMS schemas in `heroes-grid` sibling repo ✅
  - Found collection definitions: Rangers, Teams, Enemies, Expansions, Zords, Megazords, Arsenal Cards, Unique Cards, Seasons, Locations, Enemy Cards, Ranger Cards, Tags, Media, Users
  - Documented field types and relationships
  - Identified `source` field as official/tough/user filter

- [x] **1.2** Map current site requirements ✅
  - Reviewed existing Sanity queries in:
    - `AllRangers.jsx`
    - `Randomizer.jsx`
    - `Team.jsx`
    - `Ranger.jsx`
  - Documented all fields currently used for rendering
  - Identified calculated/derived fields (slugs, team positions)

- [x] **1.3** Compare Payload schema vs Site requirements ✅
  - Created comparison table of fields
  - Identified missing fields: slugs, team_position, image_url, generation
  - Identified unused fields in Payload data
  - Documented data transformations needed

### Deliverables
- ✅ `docs/PAYLOAD_SCHEMA_ANALYSIS.md` - Complete schema documentation
- ✅ `docs/DATA_COMPARISON.md` - Field-by-field comparison

### Phase 1 Complete! ✅

**What we accomplished:**
- Analyzed 15 Payload CMS collections from heroes-grid repo
- Identified `source` field for filtering official data
- Mapped all site requirements from existing React pages
- Created comprehensive field comparison
- Documented missing fields and transformation requirements

---

## Phase 2: Data Export from Turso

### Prerequisites
- ✅ Turso CLI not needed (using @libsql/client)
- ✅ Database URL and auth token provided
- ✅ Database name: `heroes-grid`

### Tasks
- [x] **2.1** Connect to Turso database ✅
  - Connected using @libsql/client package
  - Database: `libsql://heroes-grid-jorge-castellon-jr.aws-us-west-2.turso.io`

- [x] **2.2** Inspect database schema ✅
  - Found 44 tables total
  - Schema saved to `data/turso-schema.json`
  - Key tables identified

- [x] **2.3** Identify "official data" filter ✅
  - Column: `source` (TEXT)
  - Values: `'official'`, `'tough'`, `'user'`
  - **Filter: `WHERE source = 'official'`**

- [x] **2.4** Export data tables ✅
  - Created export script `scripts/export-turso-data.js`
  - Queried each table with `WHERE source = 'official'` filter
  - Exported to JSON files in `data/export/`
    - `seasons.json` (36 exported)
    - `expansions.json` (55 exported)
    - `teams.json` (43 exported)
    - `rangers.json` (304 exported with deck data)
    - `enemies.json` (103 exported with deck data)
    - `zords.json` (359 exported)
    - `megazords.json` (50 exported)
    - `ranger_cards.json` (533 exported)
    - `arsenal_cards.json` (28 exported)
    - `tags.json` (75 exported)
    - `locations.json` (24 exported)

### Export Script Template
```javascript
// scripts/export-turso-data.js
import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Export rangers (official only)
const rangers = await client.execute({
  sql: `SELECT * FROM rangers WHERE isOfficial = 1`,
  args: []
});

// Write to JSON...
```

### Deliverables
- ✅ `scripts/export-turso-data.js` - Export script
- ✅ `data/export/*.json` - 11 JSON files with all official data
- ✅ `scripts/inspect-turso-schema.js` - Schema inspection tool
- ✅ `data/turso-schema.json` - Complete database schema documentation

### Phase 2 Complete! ✅

**What we accomplished:**
- Connected to Turso database successfully
- Inspected all 44 tables and documented structure
- Identified `source = 'official'` as the filter column
- Exported all official game data with relationships
- Generated slugs for all entities
- Included complete deck data for rangers and enemies
- Total records exported: ~1,500+ rows across 11 entities

---

## Phase 3: WatermelonDB Schema Design

### Tasks
- [x] **3.1** Design complete schema in `src/database/schema.js` ✅
  - Tables created:
    - `seasons`
    - `expansions`
    - `teams`
    - `rangers`
    - `enemies` (combined footsoldiers, monsters, bosses)
    - `zords`
    - `megazords`
    - `ranger_cards`
    - `arsenal_cards`
    - `tags`
    - `locations`

- [x] **3.2** Define relationships ✅
  - Ranger → Team (belongs_to)
  - Ranger → Expansion (belongs_to)
  - Team → Season (belongs_to)
  - Enemy → Season (belongs_to)
  - Enemy → Expansion (belongs_to)
  - Zord → Expansion (belongs_to)
  - Megazord → Expansion (belongs_to)
  - RangerCard → Expansion (belongs_to)
  - ArsenalCard → Expansion (belongs_to)

- [x] **3.3** Create model classes in `src/database/models/` ✅
  - `Season.js`
  - `Expansion.js`
  - `Team.js`
  - `Ranger.js`
  - `Enemy.js`
  - `Zord.js`
  - `Megazord.js`
  - `RangerCard.js`
  - `ArsenalCard.js`
  - `Tag.js`
  - `Location.js`

### Schema Example Structure
```javascript
// src/database/schema.js
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'rangers',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'slug', type: 'string', isIndexed: true },
        { name: 'color', type: 'string' },
        { name: 'team_position', type: 'string' },
        { name: 'ability_name', type: 'string' },
        { name: 'ability_desc', type: 'string' },
        { name: 'image_url', type: 'string', isOptional: true },
        { name: 'team_id', type: 'string', isIndexed: true },
        { name: 'expansion_id', type: 'string', isIndexed: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' }
      ]
    }),
    // ... other tables
  ]
});
```

### Deliverables
- ✅ Updated `src/database/schema.js` with 11 tables
- ✅ Model files in `src/database/models/` (11 models)
- ✅ Updated `src/database/index.js` with all collections

### Phase 3 Complete! ✅

**What we accomplished:**
- Created complete WatermelonDB schema with 11 tables
- All tables properly indexed for performance
- Defined all relationships (belongs_to) between models
- Created 11 model classes with decorators
- Used `@json` decorator for array fields (deck, tags, compatible IDs)
- Registered all models in database instance
- Schema version 1 ready for seeding

---

## Phase 4: Data Migration & Seeding

### Tasks
- [x] **4.1** Create migration seed script ✅
  - Updated `src/database/seed.js`
  - Imported all JSON files from `data/export/`
  - Batch insert with proper relationship mapping

- [x] **4.2** Handle data transformations ✅
  - Converted Payload field names to WatermelonDB schema
  - Handled nested objects (deck, tags as JSON arrays)
  - Mapped foreign keys correctly (team_id, expansion_id)

- [x] **4.3** Add reset mechanism ✅
  - `resetDatabase()` function clears all data
  - Reset button in FooterNav component
  - Each seed function checks for existing data

- [x] **4.4** Test data integrity ✅
  - Verified all records imported (logs show successful seeding)
  - Relationships working (team_id, expansion_id)
  - Database initialized successfully

### Seed Script Structure
```javascript
// src/database/seed.js
import rangersData from '../../data/export/rangers.json';
import teamsData from '../../data/export/teams.json';
// ... other imports

export async function seedDatabase(database) {
  const hasBeenSeeded = localStorage.getItem('watermelondb_seeded');
  if (hasBeenSeeded) return;

  await database.write(async () => {
    const { rangers, teams, expansions } = database.collections;
    
    // Seed teams first (no dependencies)
    for (const teamData of teamsData) {
      await teams.create(team => {
        team._raw.id = teamData.id;
        team._raw.name = teamData.name;
        team._raw.slug = teamData.slug;
        // ...
      });
    }
    
    // Seed expansions
    // ...
    
    // Seed rangers (depends on teams and expansions)
    for (const rangerData of rangersData) {
      await rangers.create(ranger => {
        ranger._raw.id = rangerData.id;
        ranger._raw.name = rangerData.name;
        ranger._raw.team_id = rangerData.teamId;
        ranger._raw.expansion_id = rangerData.expansionId;
        // ...
      });
    }
  });
  
  localStorage.setItem('watermelondb_seeded', 'true');
}
```

### Deliverables
- ✅ Updated `src/database/seed.js` with 11 seed functions
- ✅ Seeded WatermelonDB with all data (~1,500 records)
- ✅ `resetDatabase()` function for clearing data
- ✅ Ranger images extracted and saved (62 images)

### Phase 4 Complete! ✅

**What we accomplished:**
- Created comprehensive seed script with all 11 data types
- Seeded: 36 seasons, 55 expansions, 43 teams, 304 rangers, 103 enemies, 359 zords, 50 megazords, 533 ranger cards, 28 arsenal cards, 75 tags, 24 locations
- All seed functions check for existing data (no duplicates)
- Reset button in nav clears and re-seeds database
- Extracted 62 Sanity image URLs with name+title+ability for unique mapping
- Database logs confirm successful initialization

---

## Phase 5: Replace Sanity with WatermelonDB

### Tasks

#### 5.1 AllRangers Page
- [ ] Replace Sanity query with WatermelonDB
- [ ] Update filtering logic for teams and colors
- [ ] Test dropdown filters
- [ ] Verify RangerCard display

#### 5.2 Randomizer Page
- [ ] Replace rangers query
- [ ] Replace enemies queries (footsoldiers, monsters, masters)
- [ ] Replace expansions query
- [ ] Update filtering by expansion
- [ ] Test random picking functionality

#### 5.3 Team Detail Page
- [ ] Replace team query with WatermelonDB
- [ ] Query rangers by team_id
- [ ] Test team page routing

#### 5.4 Ranger Detail Page
- [ ] Replace ranger query
- [ ] Include deck cards data
- [ ] Include zords data
- [ ] Test ranger page routing

### Query Examples
```javascript
// AllRangers - Get all rangers with team and expansion info
const rangers = await database.collections
  .get('rangers')
  .query()
  .fetch();

// Filter by team
const rangersByTeam = await database.collections
  .get('rangers')
  .query(Q.where('team_id', teamId))
  .fetch();

// Randomizer - Get rangers by expansion
const rangersByExpansion = await database.collections
  .get('rangers')
  .query(Q.where('expansion_id', Q.oneOf(selectedExpansionIds)))
  .fetch();
```

### Deliverables
- Updated page components using WatermelonDB
- All features working with local data

---

## Phase 6: Cleanup & Documentation

### Tasks
- [ ] **6.1** Remove Sanity dependencies
  - Uninstall `@sanity/client`
  - Remove `src/lib/sanityClient.js`
  - Remove Sanity environment variables
  - Clean up any unused Sanity queries in helpers

- [ ] **6.2** Update documentation
  - Create `docs/WATERMELONDB_SCHEMA.md` with final schema
  - Document query patterns in `docs/QUERYING_LOCAL_DATA.md`
  - Update README with local-first approach

- [ ] **6.3** Performance testing
  - Test app with full dataset
  - Verify query performance
  - Check memory usage

- [ ] **6.4** Create database reset utility
  - Add UI button to clear and re-seed database (dev tool)
  - Document how to reset database for updates

### Deliverables
- Clean codebase without Sanity
- Complete documentation
- Performance benchmarks

---

## Data Mapping Reference

### Current Sanity Fields → WatermelonDB Fields

#### Rangers
| Sanity Field | WatermelonDB Field | Type | Notes |
|--------------|-------------------|------|-------|
| `_id` | `id` | string | Primary key |
| `name` | `name` | string | |
| `rangerInfo.slug` | `slug` | string | Indexed |
| `rangerInfo.color` | `color` | string | |
| `rangerInfo.team` | `team_id` | string | Foreign key |
| `rangerInfo.teamPosition` | `team_position` | string | |
| `rangerInfo.expansion` | `expansion_id` | string | Foreign key |
| `rangerCards.abilityName` | `ability_name` | string | |
| `rangerCards.abilityDesc` | `ability_desc` | string | |
| `rangerCards.image` | `image_url` | string | |

#### Teams
| Sanity Field | WatermelonDB Field | Type | Notes |
|--------------|-------------------|------|-------|
| `_id` | `id` | string | Primary key |
| `name` | `name` | string | |
| `slug.current` | `slug` | string | Indexed |
| `gen` | `generation` | number | For sorting |

#### Enemies
Similar mapping for footsoldiers, monsters, and masters tables.

---

## Rollback Plan

If migration fails or issues arise:

1. **Keep Sanity as fallback** - Don't remove Sanity code until WatermelonDB is fully tested
2. **Feature flag** - Add environment variable to switch between Sanity and WatermelonDB
3. **Backup Turso data** - Keep exported JSON files as backup
4. **Version control** - Commit after each phase completion

---

## Timeline Estimate

- **Phase 1**: 2-3 hours (schema analysis)
- **Phase 2**: 1-2 hours (data export)
- **Phase 3**: 3-4 hours (schema design and models)
- **Phase 4**: 2-3 hours (seeding script)
- **Phase 5**: 4-5 hours (replace queries in all pages)
- **Phase 6**: 1-2 hours (cleanup)

**Total**: ~13-19 hours

---

## Success Criteria

- ✅ All official data migrated from Turso
- ✅ No Sanity API calls made
- ✅ All pages render correctly with local data
- ✅ Filtering and randomizer work as expected
- ✅ App works offline
- ✅ Performance is acceptable (queries < 100ms)
- ✅ No data loss or corruption
- ✅ Documentation is complete

---

## Next Steps

1. Review this plan and confirm approach
2. Locate Payload CMS schema files
3. Connect to Turso and inspect data
4. Begin Phase 1: Data Analysis

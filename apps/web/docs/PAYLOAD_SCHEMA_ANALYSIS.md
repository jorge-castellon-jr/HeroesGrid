# Payload CMS Schema Analysis

**Source**: `/Users/jorgecastellonjr./dev/personal/heroes-grid/src/collections/`

## Overview
Complete documentation of all Payload CMS collections, their fields, relationships, and data types.

---

## Common Fields (collectionDefaults)

All collections include these fields:

| Field | Type | Options | Required | Default | Purpose |
|-------|------|---------|----------|---------|---------|
| `status` | select | `draft`, `published` | ✅ | `draft` | Publishing status |
| `source` | select | `official`, `tough`, `user` | ✅ | `official` | **Data source identifier** |
| `expansion` | relationship | → expansions | ❌ | - | Single expansion reference |
| `expansions` | array | - | ❌ | - | Multiple expansions with details |

**Key Finding**: The `source` field is what we need to filter official data!
- `official` = Official Power Rangers game data
- `tough` = TOUGH expansion data
- `user` = User-created content

---

## Collections

### 1. Rangers

**Slug**: `rangers`  
**File**: `src/collections/rangers/Rangers.ts`

#### Fields

| Field | Type | Relationship | Required | Notes |
|-------|------|--------------|----------|-------|
| `name` | text | - | ✅ | Ranger name (e.g., "Jason Lee Scott") |
| `title` | text | - | ✅ | Full title |
| `abilityName` | text | - | ✅ | Name of ranger's ability |
| `ability` | textarea | - | ✅ | Full ability text description |
| `isOncePerBattle` | checkbox | - | ❌ | Boolean flag for ability usage |
| `team` | relationship | → teams | ✅ | Which team ranger belongs to |
| `color` | select | - | ✅ | Ranger color (18 options) |
| `type` | select | - | ✅ | `core`, `sixth`, `extra`, `ally` |
| `tags` | relationship | → tags | ❌ | Multiple tags |
| `cardTitle` | text | - | ❌ | Title shown on card bottom |
| `deck` | array | - | ❌ | Combat deck cards |
| `zords` | join | ← zords.compatibleRangers | ❌ | Zords compatible with ranger |

#### Color Options
`red`, `blue`, `black`, `yellow`, `pink`, `green`, `white`, `gold`, `silver`, `shadow`, `crimson`, `navy`, `orange`, `purple`, `zenith`, `dark`, `aqua`, `graphite`

#### Deck Array Structure
```typescript
deck: [
  {
    card: relationship → rangerCards,
    count: number (min: 1),
    overrideName: text,
    expansionData: {
      expansion: relationship → expansions,
      replaces: relationship → rangerCards
    }
  }
]
```

---

### 2. Teams

**Slug**: `teams`  
**File**: `src/collections/rangers/Teams.ts`

#### Fields

| Field | Type | Relationship | Required | Notes |
|-------|------|--------------|----------|-------|
| `name` | text | - | ✅ | Team name (unique) |
| `season` | relationship | → seasons | ❌ | Which season |
| `rangers` | join | ← rangers.team | ❌ | All rangers in team |

---

### 3. Expansions

**Slug**: `expansions`  
**File**: `src/collections/Expansions.ts`

#### Fields

| Field | Type | Relationship | Required | Notes |
|-------|------|--------------|----------|-------|
| `name` | text | - | ✅ | Expansion name (unique) |
| `urls` | array | - | ❌ | Purchase/info links |

#### URLs Array Structure
```typescript
urls: [
  {
    label: text,
    link: text
  }
]
```

---

### 4. Enemies

**Slug**: `enemies`  
**File**: `src/collections/enemy/Enemies.ts`

#### Fields

| Field | Type | Relationship | Required | Notes |
|-------|------|--------------|----------|-------|
| `name` | text | - | ✅ | Enemy name |
| `monsterType` | select | - | ✅ | `foot`, `elite`, `monster`, `nemesis`, `boss` |
| `locations` | relationship | → locations | ✅* | *Required for foot/elite only |
| `nemesisEffect` | textarea | - | ✅* | *Required for nemesis only |
| `season` | relationship | → seasons | ✅ | Which season |
| `tags` | relationship | → tags | ❌ | Multiple tags |
| `deck` | array | - | ❌ | Combat deck cards |

#### Monster Types
- `foot` = Foot Soldiers
- `elite` = Elite Foot Soldiers  
- `monster` = Monster
- `nemesis` = Nemesis
- `boss` = Boss

---

### 5. Ranger Cards

**Slug**: `rangerCards`  
**File**: `src/collections/rangers/RangerCards.ts`

Individual combat cards that can be included in ranger decks.

---

### 6. Zords

**Slug**: `zords`  
**File**: `src/collections/rangers/Zords.ts`

Zords that rangers can pilot. Has `compatibleRangers` field that creates the join relationship.

---

### 7. Megazords

**Slug**: `megazords`  
**File**: `src/collections/rangers/Megazords.ts`

Combined zord forms.

---

### 8. Arsenal Cards

**Slug**: `arsenalCards`  
**File**: `src/collections/rangers/ArsenalCards.ts`

Special equipment/weapon cards.

---

### 9. Unique Combat Cards

**Slug**: `uniqueCombatCards`  
**File**: `src/collections/rangers/UniqueCombatCards.ts`

One-off special combat cards.

---

### 10. Seasons

**Slug**: `seasons`  
**File**: `src/collections/rangers/Seasons.ts`

TV show seasons that teams and enemies are from.

---

### 11. Locations

**Slug**: `locations`  
**File**: `src/collections/enemy/Locations.ts`

Battle locations for foot soldiers.

---

### 12. Enemy Cards

**Slug**: `enemyCards`  
**File**: `src/collections/enemy/EnemyCards.ts`

Individual enemy combat cards.

---

### 13. Tags

**Slug**: `tags`  
**File**: `src/collections/Tags.ts`

Categorization tags for rangers and enemies.

---

### 14. Media

**Slug**: `media`  
**File**: `src/collections/Media.ts`

Image uploads and assets.

---

### 15. Users

**Slug**: `users`  
**File**: `src/collections/Users.ts`

User accounts for Payload CMS.

---

## Key Relationships

```
Rangers
├─→ Team (belongs to)
├─→ Tags (many)
├─→ Ranger Cards (many, through deck array)
└─→ Expansions (through expansion/expansions fields)

Teams
├─→ Season (belongs to)
└─← Rangers (has many)

Enemies
├─→ Season (belongs to)
├─→ Locations (many, for foot soldiers)
├─→ Tags (many)
├─→ Enemy Cards (many, through deck array)
└─→ Expansions (through expansion/expansions fields)

Zords
├─→ Rangers (many, compatibleRangers)
└─→ Expansions

Megazords
└─→ Expansions
```

---

## Data Filtering Strategy

### Official Data Filter
To get only official source data:
```sql
WHERE source = 'official'
```

This will exclude:
- `tough` = TOUGH expansion content
- `user` = User-created content

### Published Data Filter
To get only published content:
```sql
WHERE status = 'published' AND source = 'official'
```

---

## Missing from Payload (vs Sanity)

Based on current Sanity queries, we need these fields that might not be directly in Payload:

### Rangers
- ✅ `slug` - **Not in schema, will need to generate**
- ✅ `teamPosition` - **Not in schema, might be derived from `type` field**
- ✅ `image` - **Handled by Media uploads, need to map**

### Teams
- ✅ `slug` - **Not in schema, will need to generate from name**
- ✅ `gen` / `generation` - **Not in schema, might be in Season relationship**

### Enemies
- ✅ `image` - **Handled by Media uploads, need to map**

---

## Fields to Add During Migration

When creating WatermelonDB schema, we need to add:

1. **Slugs** - Generate from names (URL-friendly identifiers)
   - `rangers.slug` (from `name`)
   - `teams.slug` (from `name`)
   - `enemies.slug` (from `name`)

2. **Team Position** - Derive or map from `type` field
   - `core` → position in team (1st, 2nd, 3rd, etc.)
   - `sixth` → "Sixth Ranger"
   - `extra` → "Extra Ranger"
   - `ally` → "Ally"

3. **Generation** - Get from Season or add manually
   - Map seasons to generation numbers for sorting

4. **Image URLs** - Extract from Media relationships
   - Store direct URLs in WatermelonDB for performance

---

## Next Steps for Phase 1

- [x] **Task 1.1**: Analyze Payload schemas ✅
- [ ] **Task 1.2**: Map current site requirements
- [ ] **Task 1.3**: Create field comparison table


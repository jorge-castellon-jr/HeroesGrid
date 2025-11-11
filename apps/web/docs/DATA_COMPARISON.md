# Data Comparison: Payload Schema vs Site Requirements

## Overview
This document compares what data currently exists in Payload CMS with what the React site needs for rendering.

---

## Current Site Data Usage (from Sanity Queries)

### AllRangers Page

**Fields Used**:
```javascript
{
  _id,
  name,
  rangerInfo: {
    color,
    slug,
    team,
    teamPosition
  },
  rangerCards: {
    image,
    abilityName,
    abilityDesc
  }
}
```

### Randomizer Page  

**Fields Used**:
```javascript
// Rangers
{
  _id,
  name,
  slug,
  rangerInfo: {
    team,
    color,
    expansion,
    teamPosition
  },
  rangerCards: {
    image
  }
}

// Enemies (footSoldiers, monsters, masters)
{
  _id,
  name,
  expansion,
  image
}

// Expansions
{
  _id,
  name,
  image
}
```

### Team Detail Page

**Fields Used**:
```javascript
// Team
{
  name,
  rangers: [
    {
      _id,
      name,
      rangerInfo: {
        color,
        slug,
        team,
        teamPosition
      },
      rangerCards: {
        image
      }
    }
  ]
}
```

### Ranger Detail Page

**Fields Used**:
```javascript
{
  _id,
  name,
  rangerInfo: {
    color,
    slug,
    team,
    teamPosition
  },
  rangerCards: {
    image,
    deck: [
      {
        _key,
        // card details
      }
    ],
    zords: [
      {
        _key / _id,
        name,
        ability
      }
    ]
  }
}
```

---

## Field-by-Field Comparison

### Rangers Collection

| Site Needs | Payload Has | Status | Notes |
|------------|-------------|--------|-------|
| `_id` / `id` | ✅ Auto-generated | ✅ | Primary key |
| `name` | ✅ `name` | ✅ | Direct match |
| `rangerInfo.slug` | ❌ | ⚠️ **MISSING** | Need to generate from name |
| `rangerInfo.color` | ✅ `color` | ✅ | Direct match |
| `rangerInfo.team` | ✅ `team` (relationship) | ✅ | Need to resolve to team name |
| `rangerInfo.teamPosition` | ❌ | ⚠️ **MISSING** | Can derive from `type` field |
| `rangerInfo.expansion` | ✅ `expansion` / `expansions` | ✅ | Need to handle both fields |
| `rangerCards.image` | ✅ Via Media | ⚠️ **NEEDS MAPPING** | Need to extract URL from relationship |
| `rangerCards.abilityName` | ✅ `abilityName` | ✅ | Direct match |
| `rangerCards.abilityDesc` | ✅ `ability` | ✅ | Field name different |
| `rangerCards.deck` | ✅ `deck` array | ✅ | Complex relationship |
| `rangerCards.zords` | ✅ `zords` join | ✅ | Join relationship |

### Teams Collection

| Site Needs | Payload Has | Status | Notes |
|------------|-------------|--------|-------|
| `_id` / `id` | ✅ Auto-generated | ✅ | Primary key |
| `name` | ✅ `name` | ✅ | Direct match |
| `slug` | ❌ | ⚠️ **MISSING** | Need to generate from name |
| `gen` / `generation` | ❌ | ⚠️ **MISSING** | Might be in Season, or add manually |
| `rangers` (array) | ✅ `rangers` join | ✅ | Join relationship |

### Expansions Collection

| Site Needs | Payload Has | Status | Notes |
|------------|-------------|--------|-------|
| `_id` / `id` | ✅ Auto-generated | ✅ | Primary key |
| `name` | ✅ `name` | ✅ | Direct match |
| `image` | ❌ | ⚠️ **MISSING** | Not in schema, might need to add |

### Enemies Collection

| Site Needs | Payload Has | Status | Notes |
|------------|-------------|--------|-------|
| `_id` / `id` | ✅ Auto-generated | ✅ | Primary key |
| `name` | ✅ `name` | ✅ | Direct match |
| `expansion` | ✅ `expansion` / `expansions` | ✅ | Need to handle both |
| `image` | ✅ Via Media | ⚠️ **NEEDS MAPPING** | Extract URL from relationship |
| `monsterType` | ✅ `monsterType` | ✅ | Maps to footsoldier/monster/master |

---

## Missing Fields Summary

### Critical (Must Add)

1. **Slugs for all entities** - Need URL-friendly identifiers
   - `rangers.slug`
   - `teams.slug`
   - `enemies.slug`
   
2. **Image URLs** - Extract from Media relationships
   - `rangers.image_url`
   - `teams.image_url` (if needed)
   - `expansions.image_url`
   - `enemies.image_url`

3. **Team Position** - Display text for ranger role
   - Derive from `type` field:
     - `core` → "1st Ranger", "2nd Ranger", etc.
     - `sixth` → "Sixth Ranger"
     - `extra` → "Extra Ranger"
     - `ally` → "Ally"

### Important (Should Add)

4. **Generation Number** - For sorting teams chronologically
   - `teams.generation` (number)
   - Can extract from Season relationship or add manually

5. **Order/Sort Fields** - For consistent display ordering
   - `rangers.order` (within team)
   - `teams.order` (chronological)

---

## Data Transformation Requirements

### 1. Slug Generation

```javascript
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Examples:
// "Jason Lee Scott" → "jason-lee-scott"
// "Mighty Morphin" → "mighty-morphin"
```

### 2. Team Position Mapping

```javascript
function getTeamPosition(type, order) {
  const positions = {
    core: ['1st Ranger', '2nd Ranger', '3rd Ranger', '4th Ranger', '5th Ranger'],
    sixth: ['Sixth Ranger'],
    extra: ['Extra Ranger'],
    ally: ['Ally']
  };
  
  if (type === 'core' && order !== undefined) {
    return positions.core[order] || `${order + 1}th Ranger`;
  }
  
  return positions[type]?.[0] || type;
}
```

### 3. Image URL Extraction

```javascript
// Payload stores relationships like:
{
  image: {
    id: "...",
    url: "https://..."
  }
}

// Extract to flat field:
image_url: image?.url || null
```

### 4. Expansion Reference Handling

```javascript
// Payload can have either:
// - expansion: single relationship
// - expansions: array of relationships

// Normalize to single expansion ID:
const expansionId = ranger.expansion?.id || ranger.expansions?.[0]?.expansion?.id;
```

---

## WatermelonDB Schema Additions

Based on the comparison, our WatermelonDB schema needs:

```javascript
// Rangers table
{
  name: 'rangers',
  columns: [
    // From Payload
    { name: 'name', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'ability_name', type: 'string' },
    { name: 'ability', type: 'string' },
    { name: 'is_once_per_battle', type: 'boolean' },
    { name: 'color', type: 'string' },
    { name: 'type', type: 'string' }, // core, sixth, extra, ally
    { name: 'card_title', type: 'string', isOptional: true },
    
    // Generated/Derived
    { name: 'slug', type: 'string', isIndexed: true },
    { name: 'team_position', type: 'string' },
    { name: 'image_url', type: 'string', isOptional: true },
    { name: 'order', type: 'number', isOptional: true },
    
    // Relationships
    { name: 'team_id', type: 'string', isIndexed: true },
    { name: 'expansion_id', type: 'string', isIndexed: true },
    { name: 'season_id', type: 'string', isOptional: true },
    
    // Metadata
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
}

// Teams table
{
  name: 'teams',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string', isIndexed: true },
    { name: 'generation', type: 'number', isOptional: true },
    { name: 'season_id', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
}

// Expansions table
{
  name: 'expansions',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'image_url', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
}

// Enemies table
{
  name: 'enemies',
  columns: [
    { name: 'name', type: 'string' },
    { name: 'slug', type: 'string', isIndexed: true },
    { name: 'monster_type', type: 'string' }, // foot, elite, monster, nemesis, boss
    { name: 'nemesis_effect', type: 'string', isOptional: true },
    { name: 'image_url', type: 'string', isOptional: true },
    { name: 'expansion_id', type: 'string', isIndexed: true },
    { name: 'season_id', type: 'string', isOptional: true },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' }
  ]
}
```

---

## Phase 1 Completion Status

- [x] **Task 1.1**: Analyze Payload schemas ✅
- [x] **Task 1.2**: Map current site requirements ✅
- [x] **Task 1.3**: Create field comparison table ✅

## Phase 1 Complete! ✅

**Next Phase**: Export data from Turso database


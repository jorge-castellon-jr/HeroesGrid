# WatermelonDB Schema Documentation

## Overview
This document describes the complete WatermelonDB schema for the Power Rangers: Heroes of the Grid companion app. The database stores all official game data locally for offline-first functionality.

**Current Schema Version:** 5

---

## Tables

### 1. Rulebooks
Stores game rulebooks with markdown content.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| name | string | ✗ | ✗ | Rulebook name |
| content | string | ✗ | ✗ | Markdown content |
| published | boolean | ✓ | ✗ | Visibility status |

---

### 2. Seasons
Power Rangers TV seasons/series.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Season name (e.g., "Mighty Morphin") |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| order | number | ✓ | ✗ | Display order |
| published | boolean | ✓ | ✗ | Visibility status |

**Count:** 36 official seasons

---

### 3. Expansions
Game expansions and sets.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Expansion name |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| published | boolean | ✓ | ✗ | Visibility status |

**Count:** 55 official expansions

---

### 4. Teams
Ranger teams from the show.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Team name (e.g., "Mighty Morphin") |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| season_id | string | ✓ | ✓ | Foreign key to seasons |
| generation | number | ✓ | ✓ | Display order by season |
| published | boolean | ✓ | ✗ | Visibility status |

**Relationships:**
- `belongs_to` seasons

**Count:** 43 official teams

---

### 5. Rangers
Playable ranger characters.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Ranger name (e.g., "Jason Lee Scott") |
| slug | string | ✓ | ✗ | URL-friendly identifier (name-ability) |
| title | string | ✗ | ✓ | Descriptive title |
| ability_name | string | ✗ | ✗ | Ability name (e.g., "Leadership") |
| ability | string | ✗ | ✗ | Ability description |
| is_once_per_battle | boolean | ✗ | ✗ | Ability usage restriction |
| color | string | ✓ | ✗ | Ranger color for filtering |
| type | string | ✓ | ✗ | core, sixth, extra, ally |
| team_position | string | ✗ | ✗ | Position text (e.g., "Red Ranger") |
| card_title | string | ✗ | ✓ | Override title for card display |
| team_id | string | ✓ | ✗ | Foreign key to teams |
| expansion_id | string | ✓ | ✗ | Foreign key to expansions |
| deck | string (@json) | ✗ | ✗ | JSON array of deck cards |
| tags | string (@json) | ✗ | ✗ | JSON array of tag objects |
| image_url | string | ✗ | ✓ | Ranger portrait URL |
| published | boolean | ✓ | ✗ | Visibility status |

**Deck Structure (JSON):**
```json
[
  {
    "card_id": 498,
    "card_name": "VENOM CHARGE",
    "card_type": "MANEUVER",
    "count": 2,
    "override_name": null,
    "order": 1
  }
]
```

**Tags Structure (JSON):**
```json
[
  {"id": "tag-123", "name": "Female"},
  {"id": "tag-456", "name": "Leader"}
]
```

**Relationships:**
- `belongs_to` teams
- `belongs_to` expansions

**Count:** 304 official rangers

---

### 6. Enemies
Enemy characters (footsoldiers, monsters, bosses).

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Enemy name |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| monster_type | string | ✓ | ✗ | footsoldier, monster, boss |
| nemesis_effect | string | ✗ | ✓ | Special effect for bosses |
| season_id | string | ✓ | ✓ | Foreign key to seasons |
| expansion_id | string | ✓ | ✗ | Foreign key to expansions |
| deck | string (@json) | ✗ | ✗ | JSON array of enemy cards |
| locations | string (@json) | ✗ | ✗ | JSON array of location objects |
| published | boolean | ✓ | ✗ | Visibility status |

**Deck Structure (JSON):**
```json
[
  {
    "name": "PUTTY ATTACK",
    "health": 1,
    "description": "Attack effect",
    "count": 3,
    "order": 1
  }
]
```

**Locations Structure (JSON):**
```json
[
  {"id": "loc-123", "name": "Angel Grove High School"}
]
```

**Relationships:**
- `belongs_to` seasons
- `belongs_to` expansions

**Count:** 103 official enemies

---

### 7. Zords
Zord cards and units.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Zord name |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| ability | string | ✗ | ✗ | Zord ability |
| subcategory | string | ✗ | ✓ | Zord type/category |
| expansion_id | string | ✓ | ✓ | Foreign key to expansions |
| compatible_ranger_ids | string (@json) | ✗ | ✗ | JSON array of ranger IDs |
| compatible_team_ids | string (@json) | ✗ | ✗ | JSON array of team IDs |
| published | boolean | ✓ | ✗ | Visibility status |

**Compatible IDs Structure (JSON):**
```json
["ranger-123", "ranger-456"]
```

**Relationships:**
- `belongs_to` expansions

**Count:** 359 official zords

---

### 8. Megazords
Megazord cards and units.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Megazord name |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| ability | string | ✗ | ✗ | Megazord ability |
| expansion_id | string | ✓ | ✗ | Foreign key to expansions |
| compatible_team_ids | string (@json) | ✗ | ✗ | JSON array of team IDs |
| published | boolean | ✓ | ✗ | Visibility status |

**Relationships:**
- `belongs_to` expansions

**Count:** 50 official megazords

---

### 9. Ranger Cards
Combat cards for rangers.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✓ | ✗ | Card name |
| energy_cost | string | ✗ | ✗ | Energy cost (can be "X") |
| type | string | ✓ | ✗ | ATTACK, MANEUVER, REACTION, SPECIAL |
| description | string | ✗ | ✗ | Card effect |
| shields | string | ✗ | ✗ | Shield value |
| attack_dice | number | ✗ | ✗ | Number of attack dice |
| attack_hit | number | ✗ | ✗ | Static attack value |
| expansion_id | string | ✓ | ✓ | Foreign key to expansions |
| published | boolean | ✓ | ✗ | Visibility status (default: true) |

**Relationships:**
- `belongs_to` expansions

**Count:** 533 official ranger cards

---

### 10. Arsenal Cards
Combat cards for arsenal.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✓ | ✗ | Card name |
| energy_cost | string | ✗ | ✗ | Energy cost |
| type | string | ✓ | ✗ | Card type |
| description | string | ✗ | ✗ | Card effect |
| shields | string | ✗ | ✗ | Shield value |
| attack_dice | number | ✗ | ✗ | Number of attack dice |
| attack_hit | number | ✗ | ✗ | Static attack value |
| expansion_id | string | ✓ | ✓ | Foreign key to expansions |
| published | boolean | ✓ | ✗ | Visibility status (default: true) |

**Relationships:**
- `belongs_to` expansions

**Count:** 28 official arsenal cards

---

### 11. Tags
Tags for categorizing rangers.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Tag name (e.g., "Female", "Leader") |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| published | boolean | ✓ | ✗ | Visibility status |

**Count:** 75 official tags

---

### 12. Locations
Battle locations for foot soldiers.

| Column | Type | Indexed | Optional | Description |
|--------|------|---------|----------|-------------|
| id | string | ✓ | ✗ | Primary key |
| name | string | ✗ | ✗ | Location name |
| slug | string | ✓ | ✗ | URL-friendly identifier |
| published | boolean | ✓ | ✗ | Visibility status |

**Count:** 24 official locations

---

## Schema Migrations

### Version 1 (Initial)
- Created all 12 tables
- Basic relationships

### Version 2
- Added rulebooks table

### Version 3
- Added `image_url` column to rangers table

### Version 4
- Added `published` column to rangers table

### Version 5 (Current)
- Added `published` column to all remaining 11 tables
- All tables now support published/draft status
- Admin panel for managing visibility

---

## Total Records
- **~1,500 total records** across all tables
- All data sourced from official Turso/Payload CMS database
- Filtered for `source = 'official'` content only

---

## Storage
- IndexedDB (via WatermelonDB)
- Client-side only, no server synchronization
- Full offline support
- Data persists across sessions

---

## Admin Panel
Access at `/admin` route to:
- View all records in each table
- Toggle published status via checkbox
- Search and filter records
- Edit record details
- Export data to JSON

---

## Notes
- All `@json` decorated fields are stored as stringified JSON and automatically parsed by WatermelonDB
- Published status defaults:
  - Ranger cards: `true` (visible by default)
  - Arsenal cards: `true` (visible by default)
  - All other tables: `false` (draft by default)
- Rangers with `ability_name === '???'` default to `published: false`
- Frontend pages filter by `published: true` to show only visible content

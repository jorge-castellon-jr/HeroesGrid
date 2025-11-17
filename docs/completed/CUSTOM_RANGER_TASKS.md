# Custom Ranger Enhancement - Task Checklist

## Phase 1: Database Schema Updates ⏱️ 0.75 hours

> **⚠️ After completing this phase, run:**
> - `yarn lint`
> - `yarn tsc --noEmit`
> - `yarn build`

- [x] **Task 1.1**: Update CustomRanger Model
  - File: `src/database/models/CustomRanger.js`
  - Add `@json('extra_characters', (json) => json) extraCharacters` field
  - Keep existing fields (name, title, abilityName, ability) as PRIMARY character
  - Est: 20 min

- [x] **Task 1.2**: Create Database Migration
  - File: `src/database/schema.js` and `src/database/migrations.js`
  - Add `extra_characters` column (string, optional) to `custom_rangers` table
  - Version bump from 8 to 9
  - No data migration needed
  - Est: 20 min

---

## Phase 2: UI Components ⏱️ 7 hours

> **⚠️ After completing this phase, run:**
> - `yarn lint`
> - `yarn tsc --noEmit`
> - `yarn build`

- [x] **Task 2.1**: Create CharacterCardEditor Component
  - File: `src/components/CharacterCardEditor.jsx`
  - Character form (name, title, ability name, ability)
  - Add/Edit/Remove functionality
  - **"Replace" button** per character (opens ExistingRangerSelector)
  - Character card list display
  - Est: 2.5 hours

- [x] **Task 2.2**: Create ExistingRangerSelector Component
  - File: `src/components/ExistingRangerSelector.jsx`
  - Modal with ranger browser
  - Search/filter functionality
  - Load from `data/export/rangers.json`
  - Select to prefill/replace character data
  - Used for both initial add and replace
  - Est: 2 hours

- [x] **Task 2.3**: Create ExistingCardSelector Component
  - File: `src/components/ExistingCardSelector.jsx`
  - Modal with card browser
  - Query `ranger_cards` database table
  - Search/filter by type, cost, name
  - Multi-select support
  - Card preview with RangerCard component
  - On select: Copy card data (no reference kept)
  - Used for both adding new and replacing existing deck cards
  - Est: 2.5 hours

---

## Phase 3: Update Create/Edit Pages ⏱️ 6 hours

> **⚠️ After completing this phase, run:**
> - `yarn lint`
> - `yarn tsc --noEmit`
> - `yarn build`

- [x] **Task 3.1**: Update CreateCustomRanger Page
  - File: `src/pages/CreateCustomRanger.jsx`
  - [x] Keep primary character fields (name, title, abilityName, ability)
  - [x] Add `extraCharacters` state array for additional characters
  - [x] Integrate CharacterCardEditor component for extra characters
  - [x] Add "Prefill from Existing Ranger" button + ExistingRangerSelector
    - Option to replace primary character OR add as extra
  - [x] Add "Add from Existing Cards" button to deck editor + ExistingCardSelector
    - Copies card data (no reference)
  - [x] Update validation (primary character required, extras optional)
  - [x] Update save logic (save extraCharacters as JSON string)
  - Est: 3 hours

- [x] **Task 3.2**: Update CustomRangerDetail Page
  - File: `src/pages/CustomRangerDetail.jsx`
  - [x] Display mode: Show primary character + extra characters (if exist)
  - [x] Edit mode: Keep primary character fields editable
  - [x] Edit mode: Integrate CharacterCardEditor for extra characters
  - [x] Edit mode: Add "Prefill from Existing Ranger" button
  - [x] Edit mode: Add "Add from Existing Cards" button to deck editor
  - [x] Update fetch logic (load extraCharacters, null/empty for old rangers)
  - [x] Update save logic (save extraCharacters as JSON string)
  - Est: 3 hours

---

## Phase 4: Data Loading & Utilities ⏱️ 1.5 hours

> **⚠️ After completing this phase, run:**
> - `yarn lint`
> - `yarn tsc --noEmit`
> - `yarn build`

- [x] **Task 4.1**: Create Rangers Data Loader
  - File: `src/utils/dataLoaders.js`
  - [x] `loadExistingRangers()` - Load from rangers.json
  - [x] `loadExistingRangerCards()` - Query ranger_cards database table
  - [x] `searchRangers(rangers, query)` - Search by name, team, color
  - [x] `searchCards(cards, query)` - Search by name, type, description
  - Est: 1.5 hours

---

## Phase 5: Polish & Testing ⏱️ 5 hours

> **⚠️ After completing this phase, run:**
> - `yarn lint`
> - `yarn tsc --noEmit`
> - `yarn build`

- [x] **Task 5.1**: Styling & UX Polish
  - [x] Consistent styling with existing UI
  - [x] Loading states (existing components)
  - [x] Empty states (CharacterCardEditor, selectors)
  - [x] Help text and descriptions
  - [x] Responsive design (existing grid system)
  - Est: 2 hours

- [ ] **Task 5.2**: Testing
  - [ ] Create new custom ranger with primary character
  - [ ] Add extra characters manually
  - [ ] Prefill primary character from existing ranger
  - [ ] **Replace primary character with different official ranger**
  - [ ] Prefill extra character from existing ranger
  - [ ] **Replace extra character with different official ranger**
  - [ ] Add deck cards from existing ranger_cards
  - [ ] **Replace deck card with different official card**
  - [ ] Edit copied deck cards after prefill
  - [ ] Edit existing custom ranger (with/without extra characters)
  - [ ] Backward compatibility: Load old rangers (no extra characters)
  - [ ] Delete extra character cards
  - [ ] Clone custom ranger with extra characters (all data)
  - [ ] Validation edge cases
  - [ ] Test with many extra characters (no limit)
  - Est: 2 hours

- [x] **Task 5.3**: Documentation
  - [x] Create comprehensive user guide (CUSTOM_RANGER_USER_GUIDE.md)
  - [x] Create README feature update (README_FEATURE_UPDATE.md)
  - [x] Add inline help text to UI
  - [x] Document data utilities
  - Est: 1 hour

---

## Total Estimated Time: ~20.25 hours

## Key Implementation Notes

### Data Structure
```javascript
// Updated Custom Ranger
{
  // PRIMARY character (existing fields - unchanged)
  name: "Jason Lee Scott",
  slug: "custom-jason",
  title: "Mighty Morphin Red",
  abilityName: "Leadership",
  ability: "Once per battle...",
  color: "red",
  type: "core",
  teamId: "1",
  
  // NEW: Extra characters (optional)
  extraCharacters: [
    {
      name: "Jason Lee Scott",
      title: "Zeo Gold Ranger",
      abilityName: "Golden Power",
      ability: "Gain extra energy..."
    },
    {
      name: "Tommy Oliver",
      title: "Mighty Morphin Green",
      abilityName: "Dragon Shield",
      ability: "Gain shields..."
    }
  ],
  
  // Deck cards (unchanged structure)
  deck: [
    {
      name: "TEAM TACTICS",
      energyCost: "0",
      type: "maneuver",
      description: "...",
      shields: "2",
      attackDice: 0,
      attackHit: 0,
      count: 2
    }
  ]
}
```

### Backward Compatibility
```javascript
// No migration needed!
// extraCharacters is a new optional field
// Old custom rangers will have extraCharacters = null or []

// On load:
const extraChars = ranger.extraCharacters 
  ? JSON.parse(ranger.extraCharacters) 
  : [];

// Primary character fields remain unchanged
// No syncing needed - they're separate fields
```

### Card Mapping (Existing Card → Deck Card)
```javascript
// When user selects a ranger_card from database:
{
  name: card.name,
  energyCost: card.energy_cost,
  type: card.type.toLowerCase().replace(/^attack:\s*/i, ''),
  description: card.description,
  shields: card.shields,
  attackDice: card.attack_dice,
  attackHit: card.attack_hit,
  count: 1
}
// This is a COPY - no reference to original card
// User can edit all fields after prefill
```

---

## Progress Tracking

**Started**: [Date]
**Completed**: [Date]
**Total Hours**: [Actual hours]

### Phase Completion
- [x] Phase 1: Database Schema Updates
- [x] Phase 2: UI Components  
- [ ] Phase 3: Update Create/Edit Pages
- [ ] Phase 4: Data Loading & Utilities
- [ ] Phase 5: Polish & Testing

---

## Final Decisions

1. **Character Card Limit**: ✅ **No limit** - Unlimited extra characters
2. **Prefill Approach**: ✅ **Copy (no reference)** - All fields editable after copy
3. **Replace Functionality**: ✅ **Yes** - "Replace" button to re-select official ranger/card
4. **Primary Character**: ✅ **Existing columns** (name, title, abilityName, ability)
5. **Clone Behavior**: ✅ **Clone everything** - Primary + extras + deck

---

## Known Issues / Blockers

_(Track any issues or blockers here as you work)_

- 

---

## Future Enhancements (Post-MVP)

- Character card templates
- Bulk import from existing rangers
- Export/import character combinations
- Advanced search & filters
- Visual deck builder with drag-and-drop

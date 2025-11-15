# Custom Ranger Enhancement Plan

## Overview
Enhance the custom ranger system to support multiple character cards per ranger and enable prefilling data from existing rangers and ranger cards.

## Current State

### Database Structure
- **`rangers` table** - Official rangers with `deck` as JSON string
- **`ranger_cards` table** - Official ranger cards (already exists in database)
- **`custom_rangers` table** - Custom rangers with JSON deck containing card data

### Custom Ranger Model (`CustomRanger.js`)
```javascript
- name, title, abilityName, ability (PRIMARY character)
- deck (JSON array of custom card objects)
- color, type, teamId, customTeamName
```

### Custom Ranger Pages
- `CreateCustomRanger.jsx` - Create new custom rangers
- `CustomRangerDetail.jsx` - View/edit existing custom rangers

### Available Data Sources
- `data/export/rangers.json` - For prefilling character data
- `ranger_cards` database table - For prefilling deck card data

---

## Goals

### 1. Multiple Character Cards Support
Allow custom rangers to have **multiple character cards** where:
- **Primary character** = Existing fields (name, title, abilityName, ability)
- **Extra characters** = New `extra_characters` array field for additional character cards
- Each extra character includes: Character Name, Title, Ability Name, Ability Effect

### 2. Prefill from Existing Rangers
Enable users to browse existing rangers and select one to **copy** its character data into either:
- Primary character fields, OR
- Add as an extra character

### 3. Prefill Deck Cards from Existing Cards  
Enable users to browse the `ranger_cards` database and select cards to **copy** their data into the deck.
- Acts as a template/prefill - no ongoing reference to source card
- User can freely edit the copied card data afterward

---

## Implementation Tasks

### Phase 1: Database Schema Updates

#### Task 1.1: Update CustomRanger Model
- **File**: `src/database/models/CustomRanger.js`
- **Changes**:
  - Add `@json('extra_characters', (json) => json) extraCharacters` field
  - Structure: Array of additional character objects
    ```javascript
    [
      {
        name: string,
        title: string,
        abilityName: string,
        ability: string
      }
    ]
    ```
  - **Keep existing fields** (name, title, abilityName, ability) as PRIMARY character
  - Deck structure remains unchanged (already supports custom card data)
- **Estimate**: 20 minutes

#### Task 1.2: Create Database Migration
- **File**: `src/database/schema.js` and `src/database/migrations.js`
- **Changes**:
  - Add `extra_characters` column (string, optional) to `custom_rangers` table
  - Version bump from 8 to 9
  - No data migration needed (new column defaults to null/empty)
- **Estimate**: 20 minutes

---

### Phase 2: UI Components

#### Task 2.1: Create CharacterCardEditor Component
- **File**: `src/components/CharacterCardEditor.jsx` (new)
- **Features**:
  - Form inputs for character name, title, ability name, ability
  - "Add Character" button
  - List of character cards with edit/remove/replace buttons
  - "Replace" button opens ExistingRangerSelector to recopy data
  - Character card preview component
- **Estimate**: 2.5 hours

#### Task 2.2: Create ExistingRangerSelector Component
- **File**: `src/components/ExistingRangerSelector.jsx` (new)
- **Features**:
  - Modal/Dialog to browse existing rangers
  - Search/filter by name, team, color
  - Display ranger info with preview
  - "Select" button to prefill/replace character data
  - Fetch data from `data/export/rangers.json`
  - Used for both initial selection and replacing existing characters
- **Estimate**: 2 hours

#### Task 2.3: Create ExistingCardSelector Component
- **File**: `src/components/ExistingCardSelector.jsx` (new)
- **Features**:
  - Modal/Dialog to browse existing ranger cards from `ranger_cards` database table
  - Search/filter by name, type, energy cost
  - Display card preview using RangerCard component
  - "Select" button to copy/prefill card data into deck (no reference kept)
  - Support selecting multiple cards at once
  - Each selected card becomes an independent custom card (editable)
  - Used for both adding new cards and replacing existing deck cards
- **Estimate**: 2.5 hours

---

### Phase 3: Update Create/Edit Pages

#### Task 3.1: Update CreateCustomRanger Page
- **File**: `src/pages/CreateCustomRanger.jsx`
- **Changes**:
  1. **Add CharacterCardEditor for Extra Characters**:
     - Keep primary character fields (name, title, abilityName, ability) - unchanged
     - Add `extraCharacters` state (array) for additional characters
     - Integrate CharacterCardEditor component for managing extra characters
  
  2. **Add "Prefill from Existing Ranger" button**:
     - Opens ExistingRangerSelector modal
     - On selection, user chooses to:
       - Replace primary character, OR
       - Add as extra character
     - Can select multiple rangers for extra characters
  
  3. **Update Deck Editor**:
     - Add "Add from Existing Cards" button next to "Add Card"
     - Opens ExistingCardSelector modal
     - On selection, copies card data to deck (no reference kept):
       ```javascript
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
       ```
     - User can edit these fields after prefill (they're independent copies)
  
  4. **Update validation**:
     - Require primary character fields (existing validation)
     - Extra characters are optional
     - Keep existing deck validation
  
  5. **Update save logic**:
     - Save extraCharacters array to database (as JSON string)
     - Primary character fields saved normally (unchanged)
- **Estimate**: 3 hours

#### Task 3.2: Update CustomRangerDetail Page
- **File**: `src/pages/CustomRangerDetail.jsx`
- **Changes**:
  1. **Display Mode**:
     - Show primary character (existing display)
     - Show extra characters if they exist in expandable/card format
     - Display deck cards normally
  
  2. **Edit Mode**:
     - Keep primary character fields editable
     - Integrate CharacterCardEditor component for extra characters
     - Add "Prefill from Existing Ranger" functionality
     - Update deck editor with "Add from Existing Cards"
  
  3. **Update fetch/save logic**:
     - Load extraCharacters array from database (null/empty for old rangers)
     - No backward compatibility needed (new optional field)
     - Save extraCharacters array on update
- **Estimate**: 3 hours

---

### Phase 4: Data Loading & Utilities

#### Task 4.1: Create Rangers Data Loader
- **File**: `src/utils/dataLoaders.js` (new or existing)
- **Functions**:
  ```javascript
  export async function loadExistingRangers() {
    // Load from rangers.json
    // Return formatted array for character prefill
  }
  
  export async function loadExistingRangerCards() {
    // Query ranger_cards database table
    // Return formatted array with search/filter support
  }
  
  export function searchRangers(rangers, query) {
    // Search by name, team, color
  }
  
  export function searchCards(cards, query) {
    // Search by name, type, description
  }
  ```
- **Estimate**: 1.5 hours

---

### Phase 5: Polish & Testing

#### Task 5.1: Styling & UX Polish
- **Changes**:
  - Ensure consistent styling with existing UI
  - Add proper loading states
  - Add empty states for no characters/cards
  - Add helpful tooltips and instructions
  - Responsive design for mobile
- **Estimate**: 2 hours

#### Task 5.2: Testing
- **Test Cases**:
  1. Create new custom ranger with multiple characters
  2. Prefill character from existing ranger
  3. Add deck cards from existing cards
  4. Edit existing custom ranger (with/without characters array)
  5. Backward compatibility: Load old rangers without characters array
  6. Delete character cards
  7. Clone custom ranger with multiple characters
  8. Validation edge cases
- **Estimate**: 2 hours

#### Task 5.3: Documentation
- **Files**:
  - Update README with new features
  - Add inline code comments
  - Create user guide for new features
- **Estimate**: 1 hour

---

## Data Structure Examples

### Updated Custom Ranger
```javascript
{
  id: "custom-1",
  
  // PRIMARY character (existing fields)
  name: "Jason Lee Scott",
  slug: "custom-jason",
  title: "Mighty Morphin Red",
  abilityName: "Leadership",
  ability: "Once per battle, reroll any dice...",
  color: "red",
  type: "core",
  teamId: "1",
  
  // NEW: Extra characters
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
  
  // Deck (unchanged structure)
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

---

## Technical Considerations

### Backward Compatibility
**No migration needed!**
- `extraCharacters` is a new optional field
- Old custom rangers will have `extraCharacters = null` or `[]`
- Primary character fields remain unchanged
- Deck structure remains unchanged
- All existing custom rangers will continue to work without modification

### Performance
- Lazy load rangers.json only when ExistingRangerSelector opens
- Query ranger_cards table from database (already loaded)
- Implement search/filter client-side with debouncing
- Consider pagination/virtualization for large card lists (500+ cards)

### UX Considerations
- Clear visual distinction between primary and extra character cards
- Intuitive flow for adding/editing/removing extra characters
- Confirmation dialogs for destructive actions (remove character)
- Visual feedback when data is prefilled from existing ranger/card
- After prefill, user can freely edit the copied data

---

## Timeline Summary

| Phase | Estimated Time |
|-------|---------------|
| Phase 1: Database Updates | 0.75 hours |
| Phase 2: UI Components | 7 hours |
| Phase 3: Update Pages | 6 hours |
| Phase 4: Data Loading | 1.5 hours |
| Phase 5: Polish & Testing | 5 hours |
| **Total** | **~20.25 hours** |

---

## Future Enhancements

### Post-MVP Features
1. **Character Card Templates**:
   - Save character card combinations as templates
   - Quick apply templates to new rangers

2. **Bulk Import**:
   - Import multiple existing rangers at once
   - Import entire decks from existing rangers

3. **Character Card Sharing**:
   - Export/import character card data
   - Share custom character combinations with other users

4. **Advanced Search**:
   - Filter existing rangers by expansion, tags, abilities
   - Filter cards by specific attributes (energy cost range, dice count)

5. **Visual Deck Builder**:
   - Drag-and-drop interface
   - Visual deck statistics (cost distribution, type breakdown)
   - Deck validation rules (min/max cards, energy curve)

---

## Questions & Decisions

## Final Decisions

1. **Character Card Limit**: ✅ **No limit** - Users can add unlimited extra characters

2. **Edit After Prefill**: ✅ **Yes, fully editable** - All fields can be edited after copying from official ranger/card

3. **Replace Functionality**: ✅ **Yes, add "Replace" button** 
   - For character cards: Replace button opens ExistingRangerSelector to recopy data
   - For deck cards: Replace button opens ExistingCardSelector to recopy data
   - Allows re-selecting official data at any time

4. **Primary Character**: ✅ **Existing columns** (name, title, abilityName, ability)

5. **Clone Behavior**: ✅ **Clone everything** - Primary character + all extra characters + entire deck

### Design Decisions Made
1. Primary character uses existing fields; extras in new array (backward compatible)
2. Prefill = copy data (no ongoing reference to source)
3. "Replace" button allows re-selecting from official rangers/cards at any time
4. Separate modals for ranger/card selection (better UX than inline)
5. Allow selecting multiple existing cards at once (efficiency)
6. All prefilled data is fully editable after copy
7. No limit on number of extra characters

---

## Success Criteria

✅ Users can create custom rangers with multiple character cards
✅ Users can prefill character data from existing rangers
✅ Users can prefill deck cards from existing ranger cards
✅ Existing custom rangers continue to work (backward compatibility)
✅ UI is intuitive and matches existing design patterns
✅ All edge cases are handled gracefully
✅ Code is well-documented and maintainable

---

## Notes

- This enhancement maintains the existing "add card" functionality for custom cards
- The new prefill features complement (don't replace) manual card creation
- All existing custom rangers will need data migration on first edit
- Consider adding analytics to track feature usage

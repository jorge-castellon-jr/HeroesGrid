# Custom Ranger Multi-Character Feature - User Guide

## Overview

The Custom Ranger feature now supports multiple character cards per ranger, allowing you to represent rangers with multiple forms, power-ups, or abilities. You can also prefill character and deck data from the official Rangers database.

## Features

### 1. Primary Character

Every custom ranger has a **Primary Character** which includes:
- **Name**: The character's name (e.g., "Jason Lee Scott")
- **Title**: Optional title (e.g., "Mighty Morphin Red")
- **Color**: Ranger color (red, blue, yellow, etc.)
- **Type**: Core, Sixth Ranger, Extra, or Ally
- **Ability Name**: Name of the primary ability
- **Ability Description**: Full text of the ability

**Prefill Option**: Click "Prefill from Official Ranger" to automatically populate these fields from the official rangers database.

### 2. Extra Characters

Add unlimited **Extra Characters** to represent:
- Alternate ranger forms (e.g., different suits worn by the same person)
- Power-ups or super modes
- Different abilities the character can use

Each extra character includes:
- Character Name
- Title
- Ability Name
- Ability Description

**Adding Extra Characters**:
- Click "Add from Official Ranger" to browse and select from official rangers
- Click "Add Character" to manually create a new character card
- Edit, replace, or remove characters at any time

### 3. Deck Building

Build custom decks for your ranger with two options:

#### Add Custom Cards
Create cards from scratch with:
- Card Name
- Type (Attack, Maneuver, Reaction)
- Energy Cost
- Shields
- Attack values (Dice/Hit)
- Description
- Count (1-10 per card)

#### Add from Official Cards
Browse and select cards from the official ranger_cards database:
- Filter by type (Attack, Maneuver, Reaction)
- Search by name or description
- Multi-select cards to add to your deck

**Card Title Override**: Set a custom title that appears on all deck cards (optional).

## How to Use

### Creating a New Custom Ranger

1. Navigate to **My Rangers** → **Create Custom Ranger**
2. Fill in the **Primary Character** section:
   - Enter name, title, color, type, ability
   - OR click "Prefill from Official Ranger" to select an existing ranger
3. Assign to a **Team** (official team or custom team name)
4. (Optional) Add **Extra Characters**:
   - Click "Add from Official Ranger" to prefill from database
   - OR click "Add Character" to manually create
5. Build your **Deck**:
   - Add custom cards manually
   - OR click "Add from Official Cards" to browse official cards
   - Set a card title override if desired
6. Click **Create Ranger**

### Editing an Existing Custom Ranger

1. Navigate to **My Rangers**
2. Click on the custom ranger you want to edit
3. Click **Edit** button
4. Modify any sections:
   - Update primary character information
   - Add/edit/remove extra characters
   - Modify deck cards
5. Click **Save Changes**

### Cloning a Custom Ranger

1. Navigate to the custom ranger detail page
2. Click **Clone** button
3. Modify the cloned ranger as needed
4. Click **Create Ranger** to save the copy

**Note**: Cloning copies ALL data including extra characters and deck cards.

## Best Practices

### Multiple Forms Example
Create a ranger with multiple suits:
- **Primary Character**: "Tommy Oliver - Mighty Morphin Green"
- **Extra Characters**: 
  - "Tommy Oliver - Mighty Morphin White"
  - "Tommy Oliver - Zeo Red"
  - "Tommy Oliver - Turbo Red"
  - "Tommy Oliver - Dino Thunder Black"

### Power-Up Example
Create a ranger with base and powered-up forms:
- **Primary Character**: "Jason Lee Scott - Base Form"
- **Extra Characters**:
  - "Jason Lee Scott - Battle Armor Mode"
  - "Jason Lee Scott - Gold Ranger Mode"

### Prefilling Strategy
- Use "Prefill from Official Ranger" to save time on data entry
- All prefilled data is fully editable after copying
- Use the "Replace" button on extra characters to swap with a different official ranger

## Technical Details

### Data Structure
- Primary character data is stored in the main ranger fields (backward compatible)
- Extra characters are stored as JSON in the `extra_characters` column
- Deck cards are stored as JSON in the `deck` column
- No ongoing reference to source data (prefilled data is copied)

### Limitations
- No hard limit on number of extra characters
- Deck limit: 10 cards total (standard game rules)
- Card count per card: 1-10

### Backward Compatibility
Custom rangers created before this feature update will:
- Continue to work normally
- Display only their primary character
- Can be edited to add extra characters if desired

## Troubleshooting

**Issue**: "Prefill from Official Ranger" button shows no results
- **Solution**: Ensure rangers.json data is loaded. Check browser console for errors.

**Issue**: Official cards don't appear when clicking "Add from Official Cards"
- **Solution**: Database may be syncing. Wait a moment and try again.

**Issue**: Can't save ranger without primary character
- **Solution**: Name, Ability Name, and Ability Description are required for the primary character.

**Issue**: Extra character changes not saving
- **Solution**: Make sure to click "Add Character" or "Update Character" in the form before saving the ranger.

## Keyboard Shortcuts

When editing forms:
- **Enter**: Save current form (character or card)
- **Escape**: Cancel/close modal (in modal dialogs)

## Related Documents

- [Technical Implementation Plan](./custom-ranger-enhancement-plan.md)
- [Task Checklist](./CUSTOM_RANGER_TASKS.md)
- [Database Schema](../src/database/schema.js)

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify database is synced (Settings → Sync)
3. Try refreshing the page
4. Check that all required fields are filled

---

**Version**: 1.0  
**Last Updated**: 2025-01-15  
**Feature**: Custom Ranger Multi-Character Enhancement

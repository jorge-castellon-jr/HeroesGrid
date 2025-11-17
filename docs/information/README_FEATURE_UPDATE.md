# Custom Ranger Multi-Character Feature

## What's New

The Custom Ranger feature has been enhanced to support multiple character cards per ranger, with the ability to prefill data from the official Rangers and Cards database.

### Key Features

#### 🎯 Multiple Character Cards
- Add unlimited extra character cards to any custom ranger
- Perfect for representing rangers with multiple forms, power-ups, or abilities
- Each character card includes: name, title, ability name, and ability description

#### 🔄 Data Prefilling
- **Prefill from Official Rangers**: Browse 400+ official rangers and copy their data
- **Add from Official Cards**: Select cards from the official ranger_cards database
- All prefilled data is fully editable after copying

#### ✏️ Enhanced Editor
- Improved layout with Primary Character section first
- Card Title Override moved to Deck section
- Add, edit, replace, or remove characters and cards at any time
- Visual empty states and helpful tooltips

#### 📦 Backward Compatible
- Existing custom rangers continue to work without changes
- Old rangers can be edited to add new features
- Database migration automatically handles schema updates

## Quick Start

### Create a Multi-Character Ranger

```
1. Go to My Rangers → Create Custom Ranger
2. Fill Primary Character or click "Prefill from Official Ranger"
3. Add Extra Characters for alternate forms
4. Build deck with custom cards or official cards
5. Save!
```

### Example Use Cases

**Tommy Oliver's Ranger Forms**
- Primary: Mighty Morphin Green
- Extra: Mighty Morphin White, Zeo Red, Turbo Red, Dino Thunder Black

**Power-Up Modes**
- Primary: Base Ranger
- Extra: Battle Armor Mode, Super Mode

**Team Variations**
- Primary: Solo Ranger
- Extra: Team Leader Version, Powered Down Version

## Technical Details

### Database Schema
- New `extra_characters` JSON column in `custom_rangers` table
- Schema version bumped from 8 to 9
- Automatic migration on app load

### Components
- `CharacterCardEditor.jsx`: Manages extra characters
- `ExistingRangerSelector.jsx`: Browse/select official rangers
- `ExistingCardSelector.jsx`: Browse/select official cards

### Data Utilities
- `src/utils/dataLoaders.js`: Helper functions for loading/searching data

### Files Modified
- `src/database/schema.js`: Schema v9 with extra_characters column
- `src/database/migrations.js`: Migration v8→v9
- `src/database/models/CustomRanger.js`: Added extraCharacters field
- `src/pages/CreateCustomRanger.jsx`: Enhanced with new features
- `src/pages/CustomRangerDetail.jsx`: Enhanced view/edit modes

## Documentation

- **[User Guide](./CUSTOM_RANGER_USER_GUIDE.md)**: Complete user documentation
- **[Implementation Plan](./custom-ranger-enhancement-plan.md)**: Technical design document
- **[Task Checklist](./CUSTOM_RANGER_TASKS.md)**: Development progress tracking

## Development

### Build & Test
```bash
# Lint
yarn lint

# Type check
yarn tsc --noEmit

# Build
yarn build
```

### Feature Status
- ✅ Phase 1: Database Schema Updates
- ✅ Phase 2: UI Components
- ✅ Phase 3: Create/Edit Pages
- ✅ Phase 4: Data Loading Utilities
- ✅ Phase 5: Polish & Documentation
- ⏳ Testing: Manual testing required

## Migration Notes

### For Developers
- Database auto-migrates on first load after update
- No manual migration steps required
- Existing rangers unaffected (extraCharacters = null)

### For Users
- No action required for existing rangers
- New features available immediately
- Can enhance old rangers by editing them

## Screenshots

_TODO: Add screenshots of:_
- Primary Character section with prefill button
- Extra Characters section with character cards
- Deck section with official cards selector
- Character detail view showing multiple characters

## Future Enhancements

Potential improvements:
- Drag-and-drop character reordering
- Bulk import/export of character data
- Character card templates
- Advanced search filters
- Card collection management

---

**Version**: 1.0.0  
**Release Date**: 2025-01-15  
**Estimated Development Time**: 20 hours  
**Status**: ✅ Complete (excluding testing)

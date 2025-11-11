# Team Position Update

## What Changed

`team_position` has been changed from a **string** to a **number** for proper numerical sorting.

## Default Position Values

Rangers are now automatically assigned positions based on their color:

| Position | Color  |
|----------|--------|
| 1        | Red    |
| 2        | Blue   |
| 3        | Black  |
| 4        | Yellow |
| 5        | Pink   |
| 6        | Green  |
| 7+       | Others |

## How It Works

### Automatic Assignment
When seeding data, if `team_position` is not provided or is empty, the system automatically assigns a position based on the ranger's color using the defaults above.

### Manual Override
You can manually set any numeric position in the Admin panel or in your source data. Custom positions will be respected.

### Sorting
Rangers are now sorted numerically by `team_position`:
- In **All Rangers** page: By season order, then by team position
- In **Team** pages: By team position

## Schema Migration

- Schema version: `5` → `6`
- Database will need to resync on first load
- Existing users will see the sync screen and data will be re-downloaded automatically

## For Developers

### Using in Code

```javascript
import { getTeamPositionFromColor, getTeamPosition } from '../utils/colorPosition'

// Get position from color
const position = getTeamPositionFromColor('red') // Returns 1

// Get position from ranger (handles both legacy string and new number)
const position = getTeamPosition(rangerObject) // Returns number
```

### Admin Panel

The Admin panel now has a number input for team position with a helpful placeholder showing the color-to-number mapping.

## Migration Notes

Since SQLite doesn't support `ALTER COLUMN TYPE` directly, users will need to:
1. Clear their local database (happens automatically with version bump)
2. Re-download all data (happens automatically via sync system)

The version was bumped to `1.0.1` to trigger automatic resyncing.

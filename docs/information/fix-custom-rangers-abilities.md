# Fix: Missing Abilities in Cloud Custom Rangers

## Problem
- **Local (localhost):** Custom rangers have `ability` data ✅
- **Cloud (production):** Custom rangers missing `ability` data ❌
- **Result:** Phone syncs from cloud and gets incomplete data

## Root Cause
The cloud database either:
1. Didn't receive the ability data during initial push
2. Database migration didn't run properly

## Solution: Push Local Data to Cloud

### Step 1: Verify Local Data Has Abilities
Open your local app (localhost) and run in browser console:

```javascript
const db = await database.get('custom_rangers').query().fetch();
db.forEach(r => console.log(r.name, '- ability:', r.ability ? '✅ HAS DATA' : '❌ EMPTY'));
```

**Expected:** All rangers should show "✅ HAS DATA"

### Step 2: Backup Current Data (Optional but Recommended)
Export your local rangers to JSON as a backup:

```javascript
const db = await database.get('custom_rangers').query().fetch();
const backup = db.map(r => ({
  name: r.name,
  abilityName: r.abilityName,
  ability: r.ability,
  deck: r.deck,
  // ... other fields
}));
console.log(JSON.stringify(backup, null, 2));
// Copy this JSON and save it somewhere safe
```

### Step 3: Run Push Override Sync
This will replace all cloud data with your local data (which has the abilities intact).

**In the app UI:**
1. Open the sync dialog/settings
2. Select **"Push Override"** (or "Replace cloud with local")
3. Confirm the action
4. Wait for sync to complete

**OR via console (if you have access to the sync functions):**

```javascript
import customRangersSync from '@/services/customRangersSync';
import { trpc } from '@/utils/trpc'; // or wherever your trpc client is

const result = await customRangersSync.syncPushOverride(trpc);
console.log('Sync result:', result);
```

### Step 4: Verify Cloud Data
After push override completes, verify the cloud has the data:

```javascript
const cloudRangers = await trpc.customRangers.getMyRangers.query();
cloudRangers.forEach(r => console.log(r.name, '- ability:', r.ability ? '✅ HAS DATA' : '❌ EMPTY'));
```

**Expected:** All rangers should now show "✅ HAS DATA"

### Step 5: Test on Phone
1. Open the app on your phone
2. Log in with the same account
3. Trigger a sync (Pull from cloud)
4. Verify your custom rangers now have their abilities

## Alternative: Check Database Migration

If Push Override doesn't work, the cloud database might not have the `ability` column. Check if migrations ran:

### For Cloudflare D1 (if using Cloudflare Workers)
```bash
# From apps/api directory
yarn wrangler d1 execute heroes-grid --command "SELECT sql FROM sqlite_master WHERE type='table' AND name='custom_rangers';"
```

Look for the `ability` column in the output. It should show:
```sql
`ability` text NOT NULL,
```

### If Column is Missing, Run Migration
```bash
# From apps/api directory
yarn wrangler d1 migrations apply heroes-grid
```

## Prevention for Future

### Add Pre-Sync Validation
Before syncing, validate that required fields exist:

```javascript
// In customRangersSync.js, before pushing
for (const ranger of rangersToCloud) {
  if (!ranger.ability) {
    console.warn(`⚠️ Ranger "${ranger.name}" missing ability field!`);
    // Either skip or fill with default
  }
}
```

### Add Sync Preview
Show user what will change before applying sync:

```javascript
console.log('Changes that will be made:');
console.log(`- ${comparison.toCloud.length} rangers will be pushed to cloud`);
console.log(`- ${comparison.toLocal.length} rangers will be pulled from cloud`);
console.log(`- ${comparison.conflicts.length} conflicts will be resolved`);
```

### Add Automatic Backup
Export local data before destructive operations:

```javascript
// Before Pull Override or Push Override
const backup = await getLocalRangers();
localStorage.setItem('custom_rangers_backup', JSON.stringify(backup));
```

## Expected Outcome

After completing these steps:
- ✅ Cloud database will have all ability data
- ✅ Phone will sync correctly
- ✅ All devices will show complete custom ranger data

## If This Doesn't Work

If abilities are still missing after Push Override:
1. Check browser DevTools → Network tab during sync to see what data is being sent
2. Check if there are any console errors during sync
3. Verify the cloud database actually has the `ability` column
4. Check if there's a different field name being used in cloud vs local

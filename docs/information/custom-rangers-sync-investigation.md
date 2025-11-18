# Custom Rangers Sync Investigation

## Issue Report
**Date:** 2025-11-18  
**Reporter:** User  
**Symptom:** Custom rangers' "effects" disappeared after syncing

## Background Context

The HeroesGrid app includes a sync system for custom rangers that allows users to sync their custom-created rangers between local IndexedDB (via WatermelonDB) and a cloud backend (via tRPC).

## Database Schema Analysis

### Custom Rangers Table (Schema Version 9)
The `custom_rangers` table has the following ability-related fields:
- `ability_name` (string) - Name of the ability
- `ability` (string) - Full description/text of the ability

**Important Note:** There is NO field called "effect" in the schema. The user may be referring to the `ability` field when they mention "effects".

### Schema History
- **Version 7:** Initial creation of `custom_rangers` table (included `ability` field from the start)
- **Version 8:** Added `card_title` field
- **Version 9:** Added `extra_characters` field

The `ability` field has existed since the table was created and has never been renamed or removed.

## Sync System Overview

Located in: `apps/web/src/services/customRangersSync.js`

### Sync Strategies Available

1. **Auto Sync** (`autoSync`)
   - If cloud is empty and local has data → auto-push to cloud
   - If both are empty → nothing to sync
   - If no differences → already synced
   - Otherwise → requires user resolution

2. **Pull & Push** (`syncPullAndPush`)
   - Merges local and cloud data
   - Resolves conflicts by taking the newer version (based on `updatedAt` timestamp)
   - Pushes missing local rangers to cloud
   - Pulls missing cloud rangers to local

3. **Pull Override** (`syncPullOverride`)
   - ⚠️ **DESTRUCTIVE:** Deletes ALL local rangers
   - Replaces with cloud data
   - **This could cause data loss if cloud data is incomplete**

4. **Push Override** (`syncPushOverride`)
   - Deletes all cloud rangers
   - Replaces with local data

### How Ability Field is Handled in Sync

#### Reading from Local (`getLocalRangers`)
```javascript
ability: ranger.ability,  // Line 45
```

#### Syncing Single Ranger (`syncSingleRanger`)
```javascript
ability: ranger.ability,  // Line 294
```

#### Upserting to Local (`upsertLocalRangers`)
When updating existing ranger:
```javascript
r.ability = rangerData.ability;  // Line 344
```

When creating new ranger:
```javascript
ranger.ability = rangerData.ability;  // Line 366
```

**Conclusion:** The sync system DOES include the `ability` field in all operations.

## Potential Causes of Missing Abilities

### 1. Pull Override Sync
If the user ran a **Pull Override** sync and the cloud data had empty/missing abilities, this would replace all local data with the cloud version, causing abilities to disappear.

**Likelihood:** HIGH if user explicitly chose this option

### 2. Conflict Resolution Taking Wrong Version
If there was a conflict and the cloud version (with empty ability) was newer than the local version, the Pull & Push sync would choose the cloud version.

**Likelihood:** MEDIUM - depends on timestamp comparison

### 3. Cloud API Not Persisting Ability Field
If the tRPC backend (`customRangers.bulkUpsert`) doesn't properly save the `ability` field, when pulling from cloud, rangers would come back without abilities.

**Likelihood:** MEDIUM - needs backend code inspection

### 4. UI Not Saving Ability Field
If the custom ranger creation/edit form doesn't properly save the `ability` field to the local database initially.

**Likelihood:** LOW - would affect all rangers, not just synced ones

### 5. Migration Issue
If a migration ran that cleared data, but this is unlikely since migrations 7-9 only added fields, never modified existing ones.

**Likelihood:** LOW

## Recommended Investigation Steps

### Step 1: Check Current Local Data
```javascript
// In browser console
const db = await database.get('custom_rangers').query().fetch();
db.forEach(r => console.log(r.name, 'ability:', r.ability));
```

### Step 2: Check Cloud Data
Need to inspect what the tRPC backend is returning for `customRangers.getMyRangers.query()`

### Step 3: Check Last Sync Strategy Used
```javascript
// In browser console
localStorage.getItem('custom_rangers_last_sync');
```

### Step 4: Review tRPC Backend Schema
Need to verify that the backend database schema includes the `ability` field and properly persists it.

### Step 5: Check Creation/Edit Forms
Verify that `CreateCustomRanger.jsx` and `CustomRangerDetail.jsx` properly save the ability field when creating/editing rangers.

## Questions for User

1. **Which sync option did you use?**
   - Auto sync?
   - Pull & Push (merge)?
   - Pull Override (replace local with cloud)?
   - Push Override (replace cloud with local)?

2. **Did abilities exist on custom rangers before syncing?**
   - Can you confirm you saw the abilities in the UI before?

3. **Do you still have the abilities in cloud or local?**
   - Can you check if abilities exist anywhere?

4. **When was the last time you saw the abilities?**
   - Was it before a specific version bump or migration?

## Potential Fixes

### If Cloud Data is Intact
Run a **Pull Override** to restore from cloud (if cloud has the abilities)

### If Local Data is Intact
Run a **Push Override** to restore cloud from local (if local has the abilities)

### If Both Are Lost
Unfortunately, if both local and cloud have lost the ability data, there's no automatic recovery unless there's a backup of the IndexedDB or the cloud database.

## Prevention Recommendations

1. **Add Validation:** Warn user before running destructive Pull Override
2. **Add Backup:** Export local rangers to JSON before syncing
3. **Add Logging:** Log what data is being synced to help debug issues
4. **Add Dry Run:** Show preview of what will change before applying sync
5. **Add Field Validation:** Ensure required fields (like `ability`) are present before syncing

## ROOT CAUSE IDENTIFIED ✅

**Date:** 2025-11-18

### The Bug

The export function in `apps/web/src/pages/MyRangers.jsx` was exporting an incomplete transformed data object that was missing the `ability` field (and other fields).

**What happened:**
1. User exported rangers from localhost using "Export All" button
2. Export function exported `customRangers` state which only had:
   - `abilityName` ✅
   - But NOT `ability` ❌ (the actual description)
3. User imported this incomplete JSON to production
4. Production now has rangers without ability descriptions
5. Phone syncs from production and gets incomplete data

### The Fix

**File:** `apps/web/src/pages/MyRangers.jsx` (lines 74-91)

Added missing fields to the transformed ranger object:
- ✅ `ability` - The ability description text
- ✅ `title` - Character title  
- ✅ `cardTitle` - Card title
- ✅ `teamId` - Official team reference
- ✅ `customTeamName` - Custom team name
- ✅ `teamPosition` - Position in team
- ✅ `extraCharacters` - Extra character data
- ✅ `updatedAt` - Last update timestamp

### Next Steps

1. ✅ Bug fixed in code
2. Run `yarn build` to verify changes compile
3. Export rangers again from localhost with fixed code
4. Import new export to production (will now include abilities)
5. Verify abilities are present in production
6. Sync on phone to get complete data

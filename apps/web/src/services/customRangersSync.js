import { database } from '../database';

const LAST_SYNC_KEY = 'custom_rangers_last_sync';

/**
 * Get the last sync timestamp
 */
export function getLastSyncTime() {
  try {
    const timestamp = localStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  } catch (error) {
    console.error('Error reading last sync time:', error);
    return null;
  }
}

/**
 * Set the last sync timestamp
 */
function setLastSyncTime() {
  try {
    localStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error storing last sync time:', error);
  }
}

/**
 * Get all local custom rangers
 */
async function getLocalRangers() {
  const customRangersCollection = database.get('custom_rangers');
  const rangers = await customRangersCollection.query().fetch();
  
  return rangers.map(ranger => ({
    id: ranger.id,
    name: ranger.name,
    slug: ranger.slug,
    title: ranger.title || '',
    cardTitle: ranger.cardTitle || '',
    color: ranger.color,
    type: ranger.type,
    abilityName: ranger.abilityName,
    ability: ranger.ability,
    deck: ranger.deck,
    extraCharacters: ranger.extraCharacters || '',
    teamId: ranger.teamId || '',
    customTeamName: ranger.customTeamName || '',
    teamPosition: ranger.teamPosition || 1,
    published: ranger.published || false,
    createdAt: ranger.createdAt.toISOString(),
    updatedAt: ranger.updatedAt.toISOString(),
  }));
}

/**
 * Compare local and cloud rangers
 * Returns object with additions, updates, deletions needed
 */
export function compareRangers(localRangers, cloudRangers) {
  // Filter out server-only fields from cloud rangers before comparison
  const normalizedCloudRangers = cloudRangers.map(r => {
    // eslint-disable-next-line no-unused-vars
    const { likes, views, ...rest } = r;
    return rest;
  });
  
  const localMap = new Map(localRangers.map(r => [r.id, r]));
  const cloudMap = new Map(normalizedCloudRangers.map(r => [r.id, r]));
  
  const toCloud = []; // Rangers to push to cloud
  const toLocal = []; // Rangers to pull from cloud
  const conflicts = []; // Rangers that differ on both sides
  const deleteFromCloud = []; // IDs to delete from cloud
  const deleteFromLocal = []; // IDs to delete from local
  
  // Check local rangers
  for (const [id, localRanger] of localMap) {
    const cloudRanger = cloudMap.get(id);
    
    if (!cloudRanger) {
      // Only exists locally - push to cloud
      toCloud.push(localRanger);
    } else {
      // Exists in both - check if significantly different
      const localUpdated = new Date(localRanger.updatedAt).getTime();
      const cloudUpdated = new Date(cloudRanger.updatedAt).getTime();
      
      // Only consider it a conflict if timestamps differ by more than 1 second
      // (accounts for serialization differences)
      const timeDiff = Math.abs(localUpdated - cloudUpdated);
      
      if (timeDiff > 1000) {
        conflicts.push({
          local: localRanger,
          cloud: cloudRanger,
          newerSource: localUpdated > cloudUpdated ? 'local' : 'cloud',
        });
      }
    }
  }
  
  // Check cloud rangers
  for (const [id, cloudRanger] of cloudMap) {
    if (!localMap.has(id)) {
      // Only exists in cloud - pull to local
      toLocal.push(cloudRanger);
    }
  }
  
  return {
    toCloud,
    toLocal,
    conflicts,
    localCount: localRangers.length,
    cloudCount: cloudRangers.length,
    hasConflicts: conflicts.length > 0,
  };
}

/**
 * Sync strategy: Pull & Push (merge)
 * Takes newer version of conflicts, adds missing from both sides
 */
export async function syncPullAndPush(trpcClient) {
  console.log('🔄 Starting Pull & Push sync...');
  
  // Get local and cloud data
  const localRangers = await getLocalRangers();
  const cloudRangers = await trpcClient.customRangers.getMyRangers.query();
  
  // Compare
  const comparison = compareRangers(localRangers, cloudRangers);
  console.log('Comparison:', comparison);
  
  // Resolve conflicts by taking newer version
  const rangersToCloud = [...comparison.toCloud];
  const rangersToLocal = [...comparison.toLocal];
  
  for (const conflict of comparison.conflicts) {
    if (conflict.newerSource === 'local') {
      rangersToCloud.push(conflict.local);
    } else {
      rangersToLocal.push(conflict.cloud);
    }
  }
  
  // Push to cloud
  if (rangersToCloud.length > 0) {
    console.log(`⬆️ Pushing ${rangersToCloud.length} rangers to cloud...`);
    await trpcClient.customRangers.bulkUpsert.mutate({ rangers: rangersToCloud });
  }
  
  // Pull to local
  if (rangersToLocal.length > 0) {
    console.log(`⬇️ Pulling ${rangersToLocal.length} rangers from cloud...`);
    await upsertLocalRangers(rangersToLocal);
  }
  
  setLastSyncTime();
  
  return {
    success: true,
    pushed: rangersToCloud.length,
    pulled: rangersToLocal.length,
    conflicts: comparison.conflicts.length,
  };
}

/**
 * Sync strategy: Pull Override
 * Replace all local data with cloud data
 */
export async function syncPullOverride(trpcClient) {
  console.log('🔄 Starting Pull Override sync...');
  
  const cloudRangers = await trpcClient.customRangers.getMyRangers.query();
  
  // Delete all local rangers
  const customRangersCollection = database.get('custom_rangers');
  const localRangers = await customRangersCollection.query().fetch();
  
  await database.write(async () => {
    for (const ranger of localRangers) {
      await ranger.destroyPermanently();
    }
  });
  
  // Insert all cloud rangers
  await upsertLocalRangers(cloudRangers);
  
  setLastSyncTime();
  
  return {
    success: true,
    pulled: cloudRangers.length,
    deleted: localRangers.length,
  };
}

/**
 * Sync strategy: Push Override
 * Replace all cloud data with local data
 */
export async function syncPushOverride(trpcClient) {
  console.log('🔄 Starting Push Override sync...');
  
  const localRangers = await getLocalRangers();
  const cloudRangers = await trpcClient.customRangers.getMyRangers.query();
  
  // Delete all cloud rangers
  if (cloudRangers.length > 0) {
    const cloudIds = cloudRangers.map(r => r.id);
    await trpcClient.customRangers.bulkDelete.mutate({ ids: cloudIds });
  }
  
  // Push all local rangers
  if (localRangers.length > 0) {
    await trpcClient.customRangers.bulkUpsert.mutate({ rangers: localRangers });
  }
  
  setLastSyncTime();
  
  return {
    success: true,
    pushed: localRangers.length,
    deleted: cloudRangers.length,
  };
}

/**
 * Auto-sync: If cloud is empty, push local data
 * Otherwise, show conflict dialog for user to decide
 */
export async function autoSync(trpcClient) {
  console.log('🔄 Starting auto-sync...');
  
  const localRangers = await getLocalRangers();
  const cloudRangers = await trpcClient.customRangers.getMyRangers.query();
  
  // If cloud is empty and local has data, auto-push
  if (cloudRangers.length === 0 && localRangers.length > 0) {
    console.log('☁️ Cloud empty, pushing local data...');
    await trpcClient.customRangers.bulkUpsert.mutate({ rangers: localRangers });
    setLastSyncTime();
    return {
      success: true,
      strategy: 'auto-push',
      pushed: localRangers.length,
    };
  }
  
  // If both are empty, nothing to sync
  if (cloudRangers.length === 0 && localRangers.length === 0) {
    setLastSyncTime();
    return {
      success: true,
      strategy: 'nothing-to-sync',
    };
  }
  
  // Check if there are actual differences
  const comparison = compareRangers(localRangers, cloudRangers);
  
  // If no differences at all, silently succeed
  if (comparison.toCloud.length === 0 && 
      comparison.toLocal.length === 0 && 
      comparison.conflicts.length === 0) {
    setLastSyncTime();
    return {
      success: true,
      strategy: 'already-synced',
    };
  }
  
  // If there are differences, show conflict dialog for user to decide
  return {
    success: false,
    needsResolution: true,
    comparison,
  };
}

/**
 * Sync a single ranger to cloud
 */
export async function syncSingleRanger(trpcClient, rangerId) {
  const customRangersCollection = database.get('custom_rangers');
  const ranger = await customRangersCollection.find(rangerId);
  
  const rangerData = {
    id: ranger.id,
    name: ranger.name,
    slug: ranger.slug,
    title: ranger.title || '',
    cardTitle: ranger.cardTitle || '',
    color: ranger.color,
    type: ranger.type,
    abilityName: ranger.abilityName,
    ability: ranger.ability,
    deck: ranger.deck,
    extraCharacters: ranger.extraCharacters || '',
    teamId: ranger.teamId || '',
    customTeamName: ranger.customTeamName || '',
    teamPosition: ranger.teamPosition || 1,
    published: ranger.published || false,
    createdAt: ranger.createdAt.toISOString(),
    updatedAt: ranger.updatedAt.toISOString(),
  };
  
  await trpcClient.customRangers.bulkUpsert.mutate({ rangers: [rangerData] });
  
  return { success: true };
}

/**
 * Delete a ranger from cloud
 */
export async function deleteSingleRangerFromCloud(trpcClient, rangerId) {
  await trpcClient.customRangers.delete.mutate({ id: rangerId });
  return { success: true };
}

/**
 * Helper: Upsert rangers to local database
 */
async function upsertLocalRangers(rangers) {
  const customRangersCollection = database.get('custom_rangers');
  
  await database.write(async () => {
    for (const rangerData of rangers) {
      // Check if exists by id
      let existing = null;
      try {
        existing = await customRangersCollection.find(rangerData.id);
      } catch (e) {
        existing = null; // not found
      }
      
      if (existing) {
        // Update
        await existing.update(r => {
          r.name = rangerData.name;
          r.slug = rangerData.slug;
          r.title = rangerData.title || null;
          r.cardTitle = rangerData.cardTitle || null;
          r.color = rangerData.color;
          r.type = rangerData.type;
          r.abilityName = rangerData.abilityName;
          r.ability = rangerData.ability;
          r.deck = rangerData.deck;
          r.extraCharacters = rangerData.extraCharacters || null;
          r.teamId = rangerData.teamId || null;
          r.customTeamName = rangerData.customTeamName || null;
          r.teamPosition = rangerData.teamPosition || null;
          r.published = rangerData.published || false;
          r.updatedAt = new Date(rangerData.updatedAt);
        });
      } else {
        // Create
        await customRangersCollection.create(ranger => {
          // set id explicitly
          ranger._raw.id = rangerData.id;
          ranger.name = rangerData.name;
          ranger.slug = rangerData.slug;
          ranger.username = 'cloud-user';
          ranger.title = rangerData.title || null;
          ranger.cardTitle = rangerData.cardTitle || null;
          ranger.color = rangerData.color;
          ranger.type = rangerData.type;
          ranger.abilityName = rangerData.abilityName;
          ranger.ability = rangerData.ability;
          ranger.deck = rangerData.deck;
          ranger.extraCharacters = rangerData.extraCharacters || null;
          ranger.teamId = rangerData.teamId || null;
          ranger.customTeamName = rangerData.customTeamName || null;
          ranger.teamPosition = rangerData.teamPosition || null;
          ranger.published = rangerData.published || false;
          ranger.createdAt = new Date(rangerData.createdAt);
          ranger.updatedAt = new Date(rangerData.updatedAt);
        });
      }
    }
  });
}

export default {
  getLastSyncTime,
  autoSync,
  syncPullAndPush,
  syncPullOverride,
  syncPushOverride,
  syncSingleRanger,
  deleteSingleRangerFromCloud,
  compareRangers,
};

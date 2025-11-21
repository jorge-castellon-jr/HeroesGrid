import { database } from "../database"

let rangerImageMapping = null

/**
 * Load the ranger image mapping from public folder
 */
async function loadRangerImageMapping() {
	if (rangerImageMapping) return rangerImageMapping

	try {
		const response = await fetch("/ranger-token-images.json")
		rangerImageMapping = await response.json()
		return rangerImageMapping
	} catch (error) {
		console.error("Error loading ranger image mapping:", error)
		return {}
	}
}

/**
 * Update all ranger images from TTS token mapping
 * @returns {Promise<Object>} Summary of updates {updated, notFound, total}
 */
export async function updateAllRangerImages() {
  const mapping = await loadRangerImageMapping();
  try {
    const rangersCollection = database.get('rangers');
    const allRangers = await rangersCollection.query().fetch();
    
    let updated = 0;
    let notFound = 0;
    let skipped = 0;
    const results = [];
    
    for (const ranger of allRangers) {
      // Skip rangers that already have a TTS image (contains /tts-assets/)
      if (ranger.imageUrl && ranger.imageUrl.includes('/tts-assets/')) {
        skipped++;
        results.push({
          name: ranger.name,
          status: 'skipped',
          reason: 'already has TTS image'
        });
        continue;
      }
      
      // Get team info to include in matching
      let teamName = '';
      try {
        const team = await ranger.team.fetch();
        teamName = team?.name || '';
      } catch (e) {
        // Team not found, continue with empty team name
      }
      
      // Try to find matching image by abilityName, then name, then title
      // But only if team is also in the key
      let imageMeta = null;
      
      if (ranger.abilityName && teamName) {
        // First check if both abilityName AND team are in any key
        imageMeta = Object.entries(mapping).find(([key]) => {
          const keyLower = key.toLowerCase();
          return keyLower.includes(ranger.abilityName.toLowerCase()) && 
                 keyLower.includes(teamName.toLowerCase());
        })?.[1];
      }
      
      if (!imageMeta && ranger.name && teamName) {
        // Then check if both name AND team are in any key
        imageMeta = Object.entries(mapping).find(([key]) => {
          const keyLower = key.toLowerCase();
          return keyLower.includes(ranger.name.toLowerCase()) && 
                 keyLower.includes(teamName.toLowerCase());
        })?.[1];
      }
      
      if (!imageMeta && ranger.title && teamName) {
        // Finally check if both title AND team are in any key
        imageMeta = Object.entries(mapping).find(([key]) => {
          const keyLower = key.toLowerCase();
          return keyLower.includes(ranger.title.toLowerCase()) && 
                 keyLower.includes(teamName.toLowerCase());
        })?.[1];
      }
      
      if (imageMeta && imageMeta.imagePath) {
        try {
          await database.write(async () => {
            await ranger.update((r) => {
              r.imageUrl = imageMeta.imagePath
            })
          })
          
          results.push({
            name: ranger.name,
            status: 'updated',
            imageUrl: imageMeta.imagePath,
          })
          updated++
        } catch (error) {
          console.error(`Error updating ranger ${ranger.name}:`, error)
          results.push({
            name: ranger.name,
            status: 'error',
            error: error.message,
          })
        }
      } else if (!ranger.imageUrl || !ranger.imageUrl.includes('/tts-assets/')) {
        // No match found and doesn't have TTS URL, so save placeholder with folder path
        // Determine the folder based on team
        let folderPath = '/tts-assets/ranger-token';
        if (teamName) {
          const teamLower = teamName.toLowerCase();
          if (teamLower.includes('enemy') || teamLower.includes('boss') || 
              teamLower.includes('monster') || teamLower.includes('footsoldier')) {
            // Infer folder from team name if it's an enemy
            if (teamLower.includes('boss')) folderPath = '/tts-assets/enemy-boss';
            else if (teamLower.includes('monster')) folderPath = '/tts-assets/enemy-monster';
            else if (teamLower.includes('footsoldier')) folderPath = '/tts-assets/enemy-footsoldier';
          }
        }
        
        const placeholderUrl = `${folderPath}/.png`;
        
        try {
          await database.write(async () => {
            await ranger.update((r) => {
              r.imageUrl = placeholderUrl
            })
          })
          
          results.push({
            name: ranger.name,
            status: 'placeholder',
            imageUrl: placeholderUrl,
          })
          updated++
        } catch (error) {
          console.error(`Error setting placeholder for ranger ${ranger.name}:`, error)
          results.push({
            name: ranger.name,
            status: 'error',
            error: error.message,
          })
        }
      } else {
        results.push({
          name: ranger.name,
          status: 'not_found',
        })
        notFound++
      }
    }
    
    return {
      updated,
      notFound,
      skipped,
      total: allRangers.length,
      results,
    }
	} catch (error) {
		console.error("Error in updateAllRangerImages:", error)
		throw error
	}
}

/**
 * Update a single ranger image
 * @param {Object} ranger - WatermelonDB ranger record
 * @returns {Promise<boolean>} Whether the update was successful
 */
export async function updateRangerImage(ranger) {
  const mapping = await loadRangerImageMapping();

  // Skip if already using TTS image
  if (ranger.imageUrl && ranger.imageUrl.includes('/tts-assets/')) {
    return false;
  }
  
  // Try to find matching image by abilityName, then name, then title
  let imageMeta = null;
  
  if (ranger.abilityName) {
    imageMeta = Object.entries(mapping).find(([key]) => 
      key.toLowerCase().includes(ranger.abilityName.toLowerCase())
    )?.[1];
  }
  
  if (!imageMeta && ranger.name) {
    imageMeta = Object.entries(mapping).find(([key]) => 
      key.toLowerCase().includes(ranger.name.toLowerCase())
    )?.[1];
  }
  
  if (!imageMeta && ranger.title) {
    imageMeta = Object.entries(mapping).find(([key]) => 
      key.toLowerCase().includes(ranger.title.toLowerCase())
    )?.[1];
  }

	if (!imageMeta || !imageMeta.imagePath) {
		return false
	}

	try {
		await database.write(async () => {
			await ranger.update((r) => {
				r.imageUrl = imageMeta.imagePath
			})
		})
		return true
	} catch (error) {
		console.error(`Error updating ranger ${ranger.name}:`, error)
		return false
	}
}

/**
 * Get the TTS image URL for a ranger by searching for a value in mapping keys
 * @param {string} searchValue - Name, abilityName, or title to search for
 * @returns {string|null} Image path or null if not found
 */
export function getRangerImagePath(searchValue) {
  if (!rangerImageMapping) return null;
  
  const imageMeta = Object.entries(rangerImageMapping).find(([key]) => 
    key.toLowerCase().includes(searchValue.toLowerCase())
  )?.[1];
  
  return imageMeta ? imageMeta.imagePath : null;
}

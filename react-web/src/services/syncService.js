import { resetDatabase, initializeDatabase } from '../database/seed'

const STORAGE_KEY = 'heroes_grid_version'
const VERSION_URL = '/data/version.json'

/**
 * Get the currently stored version from localStorage
 */
export function getLocalVersion() {
	try {
		const stored = localStorage.getItem(STORAGE_KEY)
		return stored ? JSON.parse(stored) : null
	} catch (error) {
		console.error('Error reading local version:', error)
		return null
	}
}

/**
 * Store the current version in localStorage
 */
export function setLocalVersion(versionData) {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(versionData))
	} catch (error) {
		console.error('Error storing local version:', error)
	}
}

/**
 * Fetch the remote version data
 */
export async function fetchRemoteVersion() {
	try {
		const response = await fetch(VERSION_URL, {
			cache: 'no-store',
			headers: {
				'Cache-Control': 'no-cache',
			},
		})
		
		if (!response.ok) {
			throw new Error(`Failed to fetch version: ${response.status}`)
		}
		
		return await response.json()
	} catch (error) {
		console.error('Error fetching remote version:', error)
		throw error
	}
}

/**
 * Compare two version strings
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export function compareVersions(v1, v2) {
	const parts1 = v1.split('.').map(Number)
	const parts2 = v2.split('.').map(Number)
	
	for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
		const num1 = parts1[i] || 0
		const num2 = parts2[i] || 0
		
		if (num1 > num2) return 1
		if (num1 < num2) return -1
	}
	
	return 0
}

/**
 * Check if a sync is needed
 * Returns true if remote version is newer than local
 */
export function needsSync(localVersion, remoteVersion) {
	if (!localVersion) return true
	
	return compareVersions(remoteVersion.version, localVersion.version) > 0
}

/**
 * Preload all images from ranger data
 */
export async function preloadImages() {
	try {
		// Import ranger images data
		const rangerImagesModule = await import('../../data/export/ranger_images.json')
		const rangerImages = rangerImagesModule.default
		
		console.log(`📸 Preloading ${rangerImages.length} ranger images...`)
		
		const imagePromises = rangerImages
			.filter(img => img.imageUrl)
			.map(img => {
				return new Promise((resolve) => {
					const image = new Image()
					image.onload = () => resolve({ url: img.imageUrl, success: true })
					image.onerror = () => {
						console.warn(`Failed to load image: ${img.imageUrl}`)
						resolve({ url: img.imageUrl, success: false })
					}
					image.src = img.imageUrl
				})
			})
		
		const results = await Promise.all(imagePromises)
		const successCount = results.filter(r => r.success).length
		
		console.log(`✅ Preloaded ${successCount}/${rangerImages.length} images`)
		
		return { total: rangerImages.length, success: successCount }
	} catch (error) {
		console.error('Error preloading images:', error)
		return { total: 0, success: 0 }
	}
}

/**
 * Sync data if needed
 * This checks version and reseeds the database if necessary
 */
export async function syncDataIfNeeded(options = {}) {
	const { force = false, onProgress = null } = options
	
	try {
		console.log('🔄 Checking for data updates...')
		
		if (onProgress) onProgress({ stage: 'checking', message: 'Checking for updates...' })
		
		// Fetch remote version
		const remoteVersion = await fetchRemoteVersion()
		const localVersion = getLocalVersion()
		
		console.log('Local version:', localVersion?.version || 'none')
		console.log('Remote version:', remoteVersion.version)
		
		// Check if sync is needed
		const shouldSync = force || needsSync(localVersion, remoteVersion)
		
		if (!shouldSync) {
			console.log('✅ Data is up to date')
			if (onProgress) onProgress({ stage: 'complete', message: 'Data is up to date' })
			return { synced: false, reason: 'up-to-date' }
		}
		
		console.log('🔄 New version detected, syncing data...')
		
		// Reset and reseed database
		if (onProgress) onProgress({ stage: 'clearing', message: 'Clearing old data...' })
		await resetDatabase()
		
		if (onProgress) onProgress({ stage: 'downloading', message: 'Downloading new data...' })
		await initializeDatabase()
		
		// Preload images
		if (onProgress) onProgress({ stage: 'images', message: 'Loading images...' })
		await preloadImages()
		
		// Store new version
		setLocalVersion(remoteVersion)
		
		console.log('✅ Data sync complete')
		if (onProgress) onProgress({ stage: 'complete', message: 'Sync complete!' })
		
		return { 
			synced: true, 
			oldVersion: localVersion?.version || 'none',
			newVersion: remoteVersion.version 
		}
	} catch (error) {
		console.error('❌ Error during sync:', error)
		if (onProgress) onProgress({ stage: 'error', message: error.message })
		throw error
	}
}

/**
 * Force a full resync of all data
 */
export async function forceSync(onProgress = null) {
	return syncDataIfNeeded({ force: true, onProgress })
}

/**
 * Get sync status information
 */
export async function getSyncStatus() {
	try {
		const localVersion = getLocalVersion()
		const remoteVersion = await fetchRemoteVersion()
		
		return {
			localVersion: localVersion?.version || null,
			remoteVersion: remoteVersion.version,
			needsUpdate: needsSync(localVersion, remoteVersion),
			lastUpdated: localVersion?.lastUpdated || null,
		}
	} catch (error) {
		console.error('Error getting sync status:', error)
		return {
			localVersion: null,
			remoteVersion: null,
			needsUpdate: false,
			lastUpdated: null,
			error: error.message,
		}
	}
}

export default {
	syncDataIfNeeded,
	forceSync,
	getSyncStatus,
	getLocalVersion,
	fetchRemoteVersion,
}

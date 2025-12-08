const types = {
	ranger: "ranger-character",
	"ranger-card": "ranger-deck",
}

/**
 * Build the full image URL from display_image metadata
 * @param {Object} displayImage - Object with { filename: string, x?: number, y?: number }
 * @param {string} baseUrl - Base URL for assets (defaults to assets.heroesgrid.com)
 * @returns {string|null} Full image URL or null if displayImage is invalid
 */
export function buildImageUrl(
	displayImage,
	baseUrl = "https://assets.heroesgrid.com/assets",
	type
) {
	if (!displayImage) {
		return null
	}

	// Handle both string (JSON from WatermelonDB) and object
	let imageData = displayImage
	if (typeof displayImage === "string") {
		try {
			imageData = JSON.parse(displayImage)
		} catch (e) {
			console.error("Failed to parse displayImage JSON:", displayImage, e)
			return null
		}
	}

	if (typeof imageData !== "object") {
		return null
	}

	const { filename } = imageData
	if (!filename) {
		return null
	}

	return `${baseUrl}/${types[type] || types.ranger}/${filename}`
}

// Cache for image dimensions
let dimensionsCache = null
let dimensionsPromise = null

/**
 * Load image dimensions from JSON file
 * @returns {Promise<Object>} - Image dimensions mapping
 */
async function loadImageDimensions() {
	if (dimensionsCache) return dimensionsCache
	if (dimensionsPromise) return dimensionsPromise

	// Add cache-busting in development
	const isDev = import.meta.env.DEV
	const url = isDev 
		? `/ranger-image-dimensions.json?t=${Date.now()}`
		: '/ranger-image-dimensions.json'
	
	dimensionsPromise = fetch(url)
		.then(res => {
			console.log('Fetched ranger-image-dimensions.json, status:', res.status)
			return res.json()
		})
		.then(data => {
			console.log('Loaded image dimensions data:', data)
			dimensionsCache = data.images || {}
			console.log('dimensionsCache:', dimensionsCache)
			return dimensionsCache
		})
		.catch(err => {
			console.error('Failed to load image dimensions:', err)
			return {}
		})

	return dimensionsPromise
}

/**
 * Get sprite sheet positioning style for combat cards
 * @param {Object} displayImage - Object with { filename: string, x: number, y: number }
 * @param {Object} dimensions - Optional pre-loaded dimensions object
 * @returns {Promise<Object|null>} CSS style object for background-position and sizing or null if no positioning
 */
export async function getSpriteSheetStyle(displayImage, dimensions = null) {
	if (!displayImage) {
		return null
	}

	// Handle both string (JSON from WatermelonDB) and object
	let imageData = displayImage
	if (typeof displayImage === "string") {
		try {
			imageData = JSON.parse(displayImage)
		} catch (e) {
			console.error("Failed to parse displayImage JSON:", displayImage, e)
			return null
		}
	}

	if (typeof imageData !== "object") {
		return null
	}

	const { x, y, filename } = imageData
	if (x === undefined || y === undefined || !filename) {
		console.log('getSpriteSheetStyle: Missing required data', { x, y, filename })
		return null
	}

	// Load dimensions from JSON file or use provided dimensions
	const dimensionsMap = dimensions || (await loadImageDimensions())
	console.log('dimensionsMap keys:', Object.keys(dimensionsMap))
	console.log('Looking for filename:', filename)
	console.log('dimensionsMap[filename]:', dimensionsMap[filename])
	const dims = dimensionsMap[filename] || { columns: 1, rows: 1 }

	const columns = dims.columns
	const rows = dims.rows

	console.log('getSpriteSheetStyle:', { filename, x, y, columns, rows, dims, hasDims: !!dimensionsMap[filename] })

	// x is column number (1-based), y is row number (1-based)
	// Convert to 0-based for positioning
	const col = x - 1
	const row = y - 1

	// Use percentage-based positioning and sizing so it scales with container
	const bgPosXPercent = -col * 100
	const bgPosYPercent = -row * 100

	const style = {
		backgroundPosition: `${bgPosXPercent}% ${bgPosYPercent}%`,
		backgroundSize: `${columns * 100}% ${rows * 100}%`,
	}

	console.log('getSpriteSheetStyle result:', style)

	return style
}

/**
 * Preload image dimensions (call this early in your app)
 * @returns {Promise<Object>}
 */
export function preloadImageDimensions() {
	return loadImageDimensions()
}

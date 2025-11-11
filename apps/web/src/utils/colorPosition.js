/**
 * Convert ranger color to team position number
 * Default order: red=1, blue=2, black/green=3, yellow=4, pink=5, others=6
 */
export function getTeamPositionFromColor(color) {
	if (!color) return 6;
	
	const colorLower = color.toLowerCase();
	
	const positionMap = {
		red: 1,
		blue: 2,
		black: 3,
		green: 3,  // Green and Black are same position
		yellow: 4,
		pink: 5,
	};
	
	return positionMap[colorLower] || 6;
}

/**
 * Get position number, falling back to color if position not set
 */
export function getTeamPosition(ranger) {
	// If teamPosition is already a number, use it
	if (typeof ranger.teamPosition === 'number') {
		return ranger.teamPosition;
	}
	
	// If it's a string that can be parsed as a number, use it
	if (typeof ranger.teamPosition === 'string') {
		const parsed = parseInt(ranger.teamPosition, 10);
		if (!isNaN(parsed)) {
			return parsed;
		}
	}
	
	// Fall back to deriving from color
	return getTeamPositionFromColor(ranger.color);
}

export default {
	getTeamPositionFromColor,
	getTeamPosition,
};

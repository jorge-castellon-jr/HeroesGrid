import { database } from '../database';

/**
 * Load existing rangers from rangers.json
 * @returns {Promise<Array>} Array of ranger objects
 */
export const loadExistingRangers = async () => {
	try {
		const response = await fetch('/data/export/rangers.json');
		if (!response.ok) {
			throw new Error(`Failed to fetch rangers: ${response.statusText}`);
		}
		const data = await response.json();
		// Filter out rangers with missing ability names
		const validRangers = data.filter(r => r.ability_name && r.ability_name !== '???');
		return validRangers;
	} catch (error) {
		console.error('Error loading rangers:', error);
		throw error;
	}
};

/**
 * Load existing ranger cards from database
 * @returns {Promise<Array>} Array of card objects
 */
export const loadExistingRangerCards = async () => {
	try {
		const rangerCardsCollection = database.get('ranger_cards');
		const fetchedCards = await rangerCardsCollection.query().fetch();
		// Convert to plain objects for easier manipulation
		const cardsData = fetchedCards.map(card => ({
			id: card.id,
			name: card.name,
			energyCost: card.energyCost,
			type: card.type,
			description: card.description,
			shields: card.shields,
			attackDice: card.attackDice,
			attackHit: card.attackHit
		}));
		return cardsData;
	} catch (error) {
		console.error('Error loading cards:', error);
		throw error;
	}
};

/**
 * Search rangers by name, title, color, or ability
 * @param {Array} rangers - Array of ranger objects
 * @param {string} query - Search query string
 * @returns {Array} Filtered array of rangers
 */
export const searchRangers = (rangers, query) => {
	if (!query || !query.trim()) {
		return rangers;
	}

	const searchTerm = query.toLowerCase();
	return rangers.filter(ranger => {
		const matchName = ranger.name?.toLowerCase().includes(searchTerm);
		const matchTitle = ranger.title?.toLowerCase().includes(searchTerm);
		const matchColor = ranger.color?.toLowerCase().includes(searchTerm);
		const matchAbilityName = ranger.ability_name?.toLowerCase().includes(searchTerm);
		const matchAbility = ranger.ability?.toLowerCase().includes(searchTerm);
		const matchTeam = ranger.team?.toLowerCase().includes(searchTerm);
		
		return matchName || matchTitle || matchColor || matchAbilityName || matchAbility || matchTeam;
	});
};

/**
 * Search cards by name, type, or description
 * @param {Array} cards - Array of card objects
 * @param {string} query - Search query string
 * @param {string} typeFilter - Optional type filter ('all', 'attack', 'maneuver', 'reaction')
 * @returns {Array} Filtered array of cards
 */
export const searchCards = (cards, query, typeFilter = 'all') => {
	let filtered = cards;

	// Filter by type first
	if (typeFilter && typeFilter !== 'all') {
		filtered = filtered.filter(card => {
			const cardType = card.type?.toLowerCase() || '';
			return cardType.includes(typeFilter.toLowerCase());
		});
	}

	// Then filter by search query
	if (query && query.trim()) {
		const searchTerm = query.toLowerCase();
		filtered = filtered.filter(card => {
			const matchName = card.name?.toLowerCase().includes(searchTerm);
			const matchDescription = card.description?.toLowerCase().includes(searchTerm);
			const matchType = card.type?.toLowerCase().includes(searchTerm);
			
			return matchName || matchDescription || matchType;
		});
	}

	return filtered;
};

/**
 * Convert a ranger card from database format to deck format
 * @param {Object} card - Ranger card object from database
 * @returns {Object} Card in deck format
 */
export const convertCardToDeckFormat = (card) => {
	return {
		name: card.name,
		energyCost: card.energyCost,
		type: card.type.toLowerCase().replace(/^attack:\s*/i, ''),
		description: card.description,
		shields: card.shields,
		attackDice: card.attackDice,
		attackHit: card.attackHit,
		count: 1
	};
};

/**
 * Convert multiple ranger cards to deck format
 * @param {Array} cards - Array of ranger card objects
 * @returns {Array} Array of cards in deck format
 */
export const convertCardsToDeckFormat = (cards) => {
	return cards.map(convertCardToDeckFormat);
};

/**
 * Extract character data from a ranger object
 * @param {Object} ranger - Ranger object from rangers.json
 * @returns {Object} Character data object
 */
export const extractCharacterData = (ranger) => {
	return {
		name: ranger.name || '',
		title: ranger.title || '',
		abilityName: ranger.ability_name || '',
		ability: ranger.ability || ''
	};
};

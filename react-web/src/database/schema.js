import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
	version: 6,
	tables: [
		tableSchema({
			name: 'rulebooks',
			columns: [
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'name', type: 'string' },
				{ name: 'content', type: 'string' },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Seasons
		tableSchema({
			name: 'seasons',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'order', type: 'number', isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Expansions
		tableSchema({
			name: 'expansions',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Teams
		tableSchema({
			name: 'teams',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'season_id', type: 'string', isOptional: true, isIndexed: true },
				{ name: 'generation', type: 'number', isOptional: true, isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Rangers
		tableSchema({
			name: 'rangers',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'title', type: 'string', isOptional: true },
				{ name: 'ability_name', type: 'string' },
				{ name: 'ability', type: 'string' },
				{ name: 'is_once_per_battle', type: 'boolean' },
				{ name: 'color', type: 'string', isIndexed: true },
				{ name: 'type', type: 'string', isIndexed: true }, // core, sixth, extra, ally
				{ name: 'team_position', type: 'number', isIndexed: true },
				{ name: 'card_title', type: 'string', isOptional: true },
				{ name: 'team_id', type: 'string', isIndexed: true },
				{ name: 'expansion_id', type: 'string', isIndexed: true },
				{ name: 'deck', type: 'string' }, // JSON array of deck cards
				{ name: 'tags', type: 'string' }, // JSON array of tag objects
				{ name: 'image_url', type: 'string', isOptional: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Enemies (footsoldiers, monsters, bosses)
		tableSchema({
			name: 'enemies',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'monster_type', type: 'string', isIndexed: true }, // footsoldier, monster, boss
				{ name: 'nemesis_effect', type: 'string', isOptional: true },
				{ name: 'season_id', type: 'string', isOptional: true, isIndexed: true },
				{ name: 'expansion_id', type: 'string', isIndexed: true },
				{ name: 'deck', type: 'string' }, // JSON array of enemy cards
				{ name: 'locations', type: 'string' }, // JSON array of location objects
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Zords
		tableSchema({
			name: 'zords',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'ability', type: 'string' },
				{ name: 'subcategory', type: 'string', isOptional: true },
				{ name: 'expansion_id', type: 'string', isOptional: true, isIndexed: true },
				{ name: 'compatible_ranger_ids', type: 'string' }, // JSON array
				{ name: 'compatible_team_ids', type: 'string' }, // JSON array
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Megazords
		tableSchema({
			name: 'megazords',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'ability', type: 'string' },
				{ name: 'expansion_id', type: 'string', isIndexed: true },
				{ name: 'compatible_team_ids', type: 'string' }, // JSON array
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Ranger Cards
		tableSchema({
			name: 'ranger_cards',
			columns: [
				{ name: 'name', type: 'string', isIndexed: true },
				{ name: 'energy_cost', type: 'string' },
				{ name: 'type', type: 'string', isIndexed: true },
				{ name: 'description', type: 'string' },
				{ name: 'shields', type: 'string' },
				{ name: 'attack_dice', type: 'number' },
				{ name: 'attack_hit', type: 'number' },
				{ name: 'expansion_id', type: 'string', isOptional: true, isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Arsenal Cards
		tableSchema({
			name: 'arsenal_cards',
			columns: [
				{ name: 'name', type: 'string', isIndexed: true },
				{ name: 'energy_cost', type: 'string' },
				{ name: 'type', type: 'string', isIndexed: true },
				{ name: 'description', type: 'string' },
				{ name: 'shields', type: 'string' },
				{ name: 'attack_dice', type: 'number' },
				{ name: 'attack_hit', type: 'number' },
				{ name: 'expansion_id', type: 'string', isOptional: true, isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Tags
		tableSchema({
			name: 'tags',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),

		// Locations
		tableSchema({
			name: 'locations',
			columns: [
				{ name: 'name', type: 'string' },
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'published', type: 'boolean', isIndexed: true },
			],
		}),
	],
});

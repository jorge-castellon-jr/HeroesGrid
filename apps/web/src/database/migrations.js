import { schemaMigrations, createTable, addColumns } from '@nozbe/watermelondb/Schema/migrations';

export default schemaMigrations({
	migrations: [
		{
			// Version 1 to 2: Add all game data tables
			toVersion: 2,
			steps: [
				createTable({
					name: 'seasons',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'order', type: 'number', isIndexed: true },
					],
				}),
				createTable({
					name: 'expansions',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
					],
				}),
				createTable({
					name: 'teams',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'season_id', type: 'string', isOptional: true, isIndexed: true },
						{ name: 'generation', type: 'number', isOptional: true, isIndexed: true },
					],
				}),
				createTable({
					name: 'rangers',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'title', type: 'string', isOptional: true },
						{ name: 'ability_name', type: 'string' },
						{ name: 'ability', type: 'string' },
						{ name: 'is_once_per_battle', type: 'boolean' },
						{ name: 'color', type: 'string', isIndexed: true },
						{ name: 'type', type: 'string', isIndexed: true },
						{ name: 'team_position', type: 'string' },
						{ name: 'card_title', type: 'string', isOptional: true },
						{ name: 'team_id', type: 'string', isIndexed: true },
						{ name: 'expansion_id', type: 'string', isIndexed: true },
						{ name: 'deck', type: 'string' },
						{ name: 'tags', type: 'string' },
					],
				}),
				createTable({
					name: 'enemies',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'monster_type', type: 'string', isIndexed: true },
						{ name: 'nemesis_effect', type: 'string', isOptional: true },
						{ name: 'season_id', type: 'string', isOptional: true, isIndexed: true },
						{ name: 'expansion_id', type: 'string', isIndexed: true },
						{ name: 'deck', type: 'string' },
						{ name: 'locations', type: 'string' },
					],
				}),
				createTable({
					name: 'zords',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'ability', type: 'string' },
						{ name: 'subcategory', type: 'string', isOptional: true },
						{ name: 'expansion_id', type: 'string', isOptional: true, isIndexed: true },
						{ name: 'compatible_ranger_ids', type: 'string' },
						{ name: 'compatible_team_ids', type: 'string' },
					],
				}),
				createTable({
					name: 'megazords',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'ability', type: 'string' },
						{ name: 'expansion_id', type: 'string', isIndexed: true },
						{ name: 'compatible_team_ids', type: 'string' },
					],
				}),
				createTable({
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
					],
				}),
				createTable({
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
					],
				}),
				createTable({
					name: 'tags',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
					],
				}),
				createTable({
					name: 'locations',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
					],
				}),
			],
		},
		{
			// Version 2 to 3: Add image_url to rangers table
			toVersion: 3,
			steps: [
				addColumns({
					table: 'rangers',
					columns: [
						{ name: 'image_url', type: 'string', isOptional: true },
					],
				}),
			],
		},
		{
			// Version 3 to 4: Add published column to rangers table
			toVersion: 4,
			steps: [
				addColumns({
					table: 'rangers',
					columns: [
						{ name: 'published', type: 'boolean', isIndexed: true },
					],
				}),
			],
		},
		{
			// Version 4 to 5: Add published column to all remaining tables
			toVersion: 5,
			steps: [
				addColumns({
					table: 'rulebooks',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'seasons',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'expansions',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'teams',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'enemies',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'zords',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'megazords',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'ranger_cards',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'arsenal_cards',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'tags',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
				addColumns({
					table: 'locations',
					columns: [{ name: 'published', type: 'boolean', isIndexed: true }],
				}),
			],
		},
		{
			// Version 5 to 6: Change team_position from string to number
			// Note: This requires recreating the column in SQLite
			toVersion: 6,
			steps: [
				// SQLite doesn't support ALTER COLUMN TYPE directly
				// The migration will be handled by resetting the database with new schema
				// Users will need to resync data
			],
		},
		{
			// Version 6 to 7: Add custom_rangers table for user-created rangers
			toVersion: 7,
			steps: [
				createTable({
					name: 'custom_rangers',
					columns: [
						{ name: 'name', type: 'string' },
						{ name: 'slug', type: 'string', isIndexed: true },
						{ name: 'username', type: 'string', isIndexed: true },
						{ name: 'title', type: 'string', isOptional: true },
						{ name: 'color', type: 'string', isIndexed: true },
						{ name: 'type', type: 'string', isIndexed: true },
						{ name: 'ability_name', type: 'string' },
						{ name: 'ability', type: 'string' },
						{ name: 'deck', type: 'string' },
						{ name: 'team_id', type: 'string', isOptional: true, isIndexed: true },
						{ name: 'custom_team_name', type: 'string', isOptional: true, isIndexed: true },
						{ name: 'team_position', type: 'number', isOptional: true },
						{ name: 'published', type: 'boolean', isIndexed: true },
						{ name: 'created_at', type: 'number' },
						{ name: 'updated_at', type: 'number' },
					],
				}),
			],
		},
		{
			// Version 7 to 8: Add card_title to custom_rangers table
			toVersion: 8,
			steps: [
				addColumns({
					table: 'custom_rangers',
					columns: [
						{ name: 'card_title', type: 'string', isOptional: true },
					],
				}),
			],
		},
		{
			// Version 8 to 9: Add extra_characters to custom_rangers table
			toVersion: 9,
			steps: [
				addColumns({
					table: 'custom_rangers',
					columns: [
						{ name: 'extra_characters', type: 'string', isOptional: true },
					],
				}),
			],
		},
		{
			// Version 9 to 10: Add display_image JSON column to rangers, ranger_cards, and arsenal_cards
			toVersion: 10,
			steps: [
				addColumns({
					table: 'rangers',
					columns: [
						{ name: 'display_image', type: 'string', isOptional: true },
					],
				}),
				addColumns({
					table: 'ranger_cards',
					columns: [
						{ name: 'display_image', type: 'string', isOptional: true },
					],
				}),
				addColumns({
					table: 'arsenal_cards',
					columns: [
						{ name: 'display_image', type: 'string', isOptional: true },
					],
				}),
			],
		},
	],
});

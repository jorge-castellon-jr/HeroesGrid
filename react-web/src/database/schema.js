import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
	version: 1,
	tables: [
		tableSchema({
			name: 'rulebooks',
			columns: [
				{ name: 'slug', type: 'string', isIndexed: true },
				{ name: 'name', type: 'string' },
				{ name: 'content', type: 'string' },
			],
		}),
		// Future tables:
		// tableSchema({
		// 	name: 'rangers',
		// 	columns: [
		// 		{ name: 'slug', type: 'string', isIndexed: true },
		// 		{ name: 'name', type: 'string' },
		// 		{ name: 'color', type: 'string' },
		// 		{ name: 'team', type: 'string' },
		// 		{ name: 'abilities', type: 'string' }, // JSON
		// 		{ name: 'deck', type: 'string' }, // JSON
		// 	],
		// }),
		// tableSchema({
		// 	name: 'custom_rangers',
		// 	columns: [
		// 		{ name: 'name', type: 'string' },
		// 		{ name: 'color', type: 'string' },
		// 		{ name: 'abilities', type: 'string' }, // JSON
		// 		{ name: 'deck', type: 'string' }, // JSON
		// 		{ name: 'created_at', type: 'number' },
		// 		{ name: 'updated_at', type: 'number' },
		// 	],
		// }),
	],
});

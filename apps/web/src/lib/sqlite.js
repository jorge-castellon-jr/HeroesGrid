import initSqlJs from 'sql.js';

let SQL = null;
let db = null;

/**
 * Initialize sql.js and load the database
 * @param {string} dbPath - Path to the SQLite database file
 */
export async function initDatabase(dbPath = '/data/content.db') {
	try {
		// Initialize sql.js
		if (!SQL) {
			SQL = await initSqlJs({
				locateFile: (file) => `https://sql.js.org/dist/${file}`,
			});
		}

		// Load the database file
		const response = await fetch(dbPath);
		const buffer = await response.arrayBuffer();
		db = new SQL.Database(new Uint8Array(buffer));

		return db;
	} catch (error) {
		console.error('Error initializing database:', error);
		throw error;
	}
}

/**
 * Execute a SQL query
 * @param {string} query - SQL query string
 * @param {array} params - Query parameters
 * @returns {array} Query results
 */
export function executeQuery(query, params = []) {
	if (!db) {
		throw new Error('Database not initialized. Call initDatabase() first.');
	}

	try {
		const results = db.exec(query, params);
		return results;
	} catch (error) {
		console.error('Error executing query:', error);
		throw error;
	}
}

/**
 * Get all rulebooks
 */
export function getAllRulebooks() {
	const results = executeQuery('SELECT * FROM rulebooks ORDER BY name');
	if (results.length === 0) return [];
	
	return results[0].values.map((row) => {
		const obj = {};
		results[0].columns.forEach((col, i) => {
			obj[col] = row[i];
		});
		return obj;
	});
}

/**
 * Get a single rulebook by slug
 * @param {string} slug - Rulebook slug
 */
export function getRulebookBySlug(slug) {
	const results = executeQuery('SELECT * FROM rulebooks WHERE slug = ?', [slug]);
	if (results.length === 0) return null;
	
	const row = results[0].values[0];
	const obj = {};
	results[0].columns.forEach((col, i) => {
		obj[col] = row[i];
	});
	return obj;
}

/**
 * Close the database connection
 */
export function closeDatabase() {
	if (db) {
		db.close();
		db = null;
	}
}

export default {
	initDatabase,
	executeQuery,
	getAllRulebooks,
	getRulebookBySlug,
	closeDatabase,
};

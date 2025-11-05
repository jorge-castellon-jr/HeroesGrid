import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import schema from './schema';
import Rulebook from './models/Rulebook';

// Create adapter - LokiJS is good for web
const adapter = new LokiJSAdapter({
	schema,
	useWebWorker: false,
	useIncrementalIndexedDB: true,
	dbName: 'heroesGrid',
});

// Create database instance
export const database = new Database({
	adapter,
	modelClasses: [Rulebook],
});

export default database;

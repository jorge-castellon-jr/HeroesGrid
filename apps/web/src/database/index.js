import { Database } from '@nozbe/watermelondb';
import LokiJSAdapter from '@nozbe/watermelondb/adapters/lokijs';

import schema from './schema';
import migrations from './migrations';
import Rulebook from './models/Rulebook';
import Season from './models/Season';
import Expansion from './models/Expansion';
import Team from './models/Team';
import Ranger from './models/Ranger';
import Enemy from './models/Enemy';
import Zord from './models/Zord';
import Megazord from './models/Megazord';
import RangerCard from './models/RangerCard';
import ArsenalCard from './models/ArsenalCard';
import Tag from './models/Tag';
import Location from './models/Location';
import CustomRanger from './models/CustomRanger';

// Create adapter - LokiJS is good for web
const adapter = new LokiJSAdapter({
	schema,
	migrations,
	useWebWorker: false,
	useIncrementalIndexedDB: true,
	dbName: 'heroesGrid',
});

// Create database instance
export const database = new Database({
	adapter,
	modelClasses: [
		Rulebook,
		Season,
		Expansion,
		Team,
		Ranger,
		Enemy,
		Zord,
		Megazord,
		RangerCard,
		ArsenalCard,
		Tag,
		Location,
		CustomRanger,
	],
});

export default database;

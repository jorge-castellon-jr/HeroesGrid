import { Model } from '@nozbe/watermelondb';
import { field, relation, json } from '@nozbe/watermelondb/decorators';

export default class Enemy extends Model {
	static table = 'enemies';

	static associations = {
		seasons: { type: 'belongs_to', key: 'season_id' },
		expansions: { type: 'belongs_to', key: 'expansion_id' },
	};

	@field('name') name;
	@field('slug') slug;
	@field('monster_type') monsterType;
	@field('nemesis_effect') nemesisEffect;
	@field('season_id') seasonId;
	@field('expansion_id') expansionId;
	@field('published') published;

	@json('deck', (json) => json) deck;
	@json('locations', (json) => json) locations;

	@relation('seasons', 'season_id') season;
	@relation('expansions', 'expansion_id') expansion;
}

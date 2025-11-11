import { Model } from '@nozbe/watermelondb';
import { field, relation } from '@nozbe/watermelondb/decorators';

export default class Team extends Model {
	static table = 'teams';

	static associations = {
		seasons: { type: 'belongs_to', key: 'season_id' },
	};

	@field('name') name;
	@field('slug') slug;
	@field('season_id') seasonId;
	@field('generation') generation;
	@field('published') published;

	@relation('seasons', 'season_id') season;
}

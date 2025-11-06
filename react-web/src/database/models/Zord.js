import { Model } from '@nozbe/watermelondb';
import { field, relation, json } from '@nozbe/watermelondb/decorators';

export default class Zord extends Model {
	static table = 'zords';

	static associations = {
		expansions: { type: 'belongs_to', key: 'expansion_id' },
	};

	@field('name') name;
	@field('slug') slug;
	@field('ability') ability;
	@field('subcategory') subcategory;
	@field('expansion_id') expansionId;
	@field('published') published;

	@json('compatible_ranger_ids', (json) => json) compatibleRangerIds;
	@json('compatible_team_ids', (json) => json) compatibleTeamIds;

	@relation('expansions', 'expansion_id') expansion;
}

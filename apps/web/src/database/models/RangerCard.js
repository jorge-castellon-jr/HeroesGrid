import { Model } from '@nozbe/watermelondb';
import { field, relation, json } from '@nozbe/watermelondb/decorators';

export default class RangerCard extends Model {
	static table = 'ranger_cards';

	static associations = {
		expansions: { type: 'belongs_to', key: 'expansion_id' },
	};

	@field('name') name;
	@field('energy_cost') energyCost;
	@field('type') type;
	@field('description') description;
	@field('shields') shields;
	@field('attack_dice') attackDice;
	@field('attack_hit') attackHit;
	@field('expansion_id') expansionId;
	@field('published') published;

	@json('display_image', (json) => json) displayImage;

	@relation('expansions', 'expansion_id') expansion;
}

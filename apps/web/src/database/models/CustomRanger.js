import { Model } from '@nozbe/watermelondb';
import { field, relation, json, date } from '@nozbe/watermelondb/decorators';

export default class CustomRanger extends Model {
	static table = 'custom_rangers';

	static associations = {
		teams: { type: 'belongs_to', key: 'team_id' },
	};

	@field('name') name;
	@field('slug') slug;
	@field('username') username;
	@field('title') title;
	@field('card_title') cardTitle;
	@field('color') color;
	@field('type') type;
	@field('ability_name') abilityName;
	@field('ability') ability;
	@field('team_id') teamId;
	@field('custom_team_name') customTeamName;
	@field('team_position') teamPosition;
	@field('published') published;
	@date('created_at') createdAt;
	@date('updated_at') updatedAt;

	@json('deck', (json) => json) deck;
	@json('extra_characters', (json) => json) extraCharacters;

	@relation('teams', 'team_id') team;
}

import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Expansion extends Model {
	static table = 'expansions';

	@field('name') name;
	@field('slug') slug;
	@field('published') published;
}

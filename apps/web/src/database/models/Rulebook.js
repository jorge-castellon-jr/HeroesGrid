import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Rulebook extends Model {
	static table = 'rulebooks';

	@field('slug') slug;
	@field('name') name;
	@field('content') content;
	@field('published') published;
}

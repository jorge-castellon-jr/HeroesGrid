import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Tag extends Model {
	static table = 'tags';

	@field('name') name;
	@field('slug') slug;
	@field('published') published;
}

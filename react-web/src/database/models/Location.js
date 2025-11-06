import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Location extends Model {
	static table = 'locations';

	@field('name') name;
	@field('slug') slug;
	@field('published') published;
}

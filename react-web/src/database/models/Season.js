import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Season extends Model {
	static table = 'seasons';

	@field('name') name;
	@field('slug') slug;
	@field('order') order;
	@field('published') published;
}

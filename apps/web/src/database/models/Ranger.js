import { Model } from "@nozbe/watermelondb"
import { field, relation, json } from "@nozbe/watermelondb/decorators"

export default class Ranger extends Model {
	static table = "rangers"

	static associations = {
		teams: { type: "belongs_to", key: "team_id" },
		expansions: { type: "belongs_to", key: "expansion_id" },
	}

	@field("name") name
	@field("slug") slug
	@field("title") title
	@field("ability_name") abilityName
	@field("ability") ability
	@field("is_once_per_battle") isOncePerBattle
	@field("color") color
	@field("type") type
	@field("team_position") teamPosition
	@field("card_title") cardTitle
	@field("team_id") teamId
	@field("expansion_id") expansionId
	@field("image_url") imageUrl
	@field("published") published

	@json("display_image", (json) => json) displayImage
	@json("deck", (json) => json) deck
	@json("tags", (json) => json) tags

	@relation("teams", "team_id") team
	@relation("expansions", "expansion_id") expansion
}

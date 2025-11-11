import { Model } from "@nozbe/watermelondb"
import { field, relation, json } from "@nozbe/watermelondb/decorators"

export default class Megazord extends Model {
	static table = "megazords"

	static associations = {
		expansions: { type: "belongs_to", key: "expansion_id" },
	}

	@field("name") name
	@field("slug") slug
	@field("ability") ability
	@field("expansion_id") expansionId
	@field("published") published

	@json("compatible_team_ids", (json) => json) compatibleTeamIds

	@relation("expansions", "expansion_id") expansion
}

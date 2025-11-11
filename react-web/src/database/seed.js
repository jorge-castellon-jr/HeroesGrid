import database from "./index"
import { getTeamPositionFromColor } from "../utils/colorPosition"

// Import all exported data
import seasonsData from "../../data/export/seasons.json"
import expansionsData from "../../data/export/expansions.json"
import teamsData from "../../data/export/teams.json"
import rangersData from "../../data/export/rangers.json"
import enemiesData from "../../data/export/enemies.json"
import zordsData from "../../data/export/zords.json"
import megazordsData from "../../data/export/megazords.json"
import rangerCardsData from "../../data/export/ranger_cards.json"
import arsenalCardsData from "../../data/export/arsenal_cards.json"
import tagsData from "../../data/export/tags.json"
import locationsData from "../../data/export/locations.json"
import rangerImagesData from "../../data/export/ranger_images.json"

// Singleton to track initialization
let initializationPromise = null

// Function to parse markdown frontmatter
function parseMD(content) {
	const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)

	if (!frontmatterMatch) {
		return { name: "", content: content }
	}

	const frontmatter = frontmatterMatch[1]
	const mdContent = frontmatterMatch[2]

	const nameMatch = frontmatter.match(/name:\s*["'](.+?)["']/)
	const name = nameMatch ? nameMatch[1] : ""

	return { name, content: mdContent.trim() }
}

// Seed seasons
export async function seedSeasons() {
	const seasonsCollection = database.get("seasons")

	const existingCount = await seasonsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Seasons already seeded")
		return
	}

	await database.write(async () => {
		for (const season of seasonsData) {
			await seasonsCollection.create((record) => {
				record._raw.id = String(season.id)
				record.name = season.name
				record.slug = season.slug
				record.order = season.order
				record.published = season.published ?? false
			})
		}
		console.log(`✅ Seeded ${seasonsData.length} seasons`)
	})
}

// Seed expansions
export async function seedExpansions() {
	const expansionsCollection = database.get("expansions")

	const existingCount = await expansionsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Expansions already seeded")
		return
	}

	await database.write(async () => {
		for (const expansion of expansionsData) {
			await expansionsCollection.create((record) => {
				record._raw.id = String(expansion.id)
				record.name = expansion.name
				record.slug = expansion.slug
				record.published = expansion.published ?? false
			})
		}
		console.log(`✅ Seeded ${expansionsData.length} expansions`)
	})
}

// Seed teams
export async function seedTeams() {
	const teamsCollection = database.get("teams")

	const existingCount = await teamsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Teams already seeded")
		return
	}

	await database.write(async () => {
		for (const team of teamsData) {
			await teamsCollection.create((record) => {
				record._raw.id = String(team.id)
				record.name = team.name
				record.slug = team.slug
				record.seasonId = team.season_id ? String(team.season_id) : null
				record.generation = team.generation
				record.published = team.published ?? false
			})
		}
		console.log(`✅ Seeded ${teamsData.length} teams`)
	})
}

// Seed rangers
export async function seedRangers() {
	const rangersCollection = database.get("rangers")

	const existingCount = await rangersCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Rangers already seeded")
		return
	}

	await database.write(async () => {
		for (const ranger of rangersData) {
			// Find matching image by name and ability
			const imageMatch = rangerImagesData.find(
				(img) => img.name === ranger.name && img.ability === ranger.ability_name
			)

			// Use team_position from JSON if it exists and is a number, otherwise calculate
			let teamPosition;
			if (typeof ranger.team_position === 'number') {
				// Use the value from JSON if it's already a number
				teamPosition = ranger.team_position;
			} else {
				// Calculate based on ranger type for old data
				if (ranger.type === 'core') {
					teamPosition = getTeamPositionFromColor(ranger.color);
				} else if (ranger.type === 'sixth') {
					teamPosition = 6;
				} else {
					teamPosition = 7;
				}
			}

			await rangersCollection.create((record) => {
				record._raw.id = String(ranger.id)
				record.name = ranger.name
				record.slug = ranger.slug
				record.title = ranger.title
				record.abilityName = ranger.ability_name
				record.ability = ranger.ability
				record.isOncePerBattle = ranger.is_once_per_battle
				record.color = ranger.color
				record.type = ranger.type
				record.teamPosition = teamPosition
				record.cardTitle = ranger.card_title
				record.teamId = String(ranger.team_id)
				record.expansionId = String(ranger.expansion_id)
				record.deck = typeof ranger.deck === 'string' ? JSON.parse(ranger.deck) : ranger.deck
				record.tags = typeof ranger.tags === 'string' ? JSON.parse(ranger.tags) : ranger.tags
				record.imageUrl = imageMatch?.imageUrl || null
				record.published = ranger.published ?? ranger.ability_name !== "???"
			})
		}
		console.log(`✅ Seeded ${rangersData.length} rangers`)
	})
}

// Seed enemies
export async function seedEnemies() {
	const enemiesCollection = database.get("enemies")

	const existingCount = await enemiesCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Enemies already seeded")
		return
	}

	await database.write(async () => {
		for (const enemy of enemiesData) {
			await enemiesCollection.create((record) => {
				record._raw.id = String(enemy.id)
				record.name = enemy.name
				record.slug = enemy.slug
				record.monsterType = enemy.monster_type
				record.nemesisEffect = enemy.nemesis_effect
				record.seasonId = enemy.season_id ? String(enemy.season_id) : null
				record.expansionId = String(enemy.expansion_id)
				record.deck = typeof enemy.deck === 'string' ? JSON.parse(enemy.deck) : enemy.deck
				record.locations = typeof enemy.locations === 'string' ? JSON.parse(enemy.locations) : enemy.locations
				record.published = enemy.published ?? false
			})
		}
		console.log(`✅ Seeded ${enemiesData.length} enemies`)
	})
}

// Seed zords
export async function seedZords() {
	const zordsCollection = database.get("zords")

	const existingCount = await zordsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Zords already seeded")
		return
	}

	await database.write(async () => {
		for (const zord of zordsData) {
			await zordsCollection.create((record) => {
				record._raw.id = String(zord.id)
				record.name = zord.name
				record.slug = zord.slug
				record.ability = zord.ability
				record.subcategory = zord.subcategory
				record.expansionId = zord.expansion_id
					? String(zord.expansion_id)
					: null
				record.compatibleRangerIds = typeof zord.compatible_ranger_ids === 'string' ? JSON.parse(zord.compatible_ranger_ids) : zord.compatible_ranger_ids
				record.compatibleTeamIds = typeof zord.compatible_team_ids === 'string' ? JSON.parse(zord.compatible_team_ids) : zord.compatible_team_ids
				record.published = zord.published ?? false
			})
		}
		console.log(`✅ Seeded ${zordsData.length} zords`)
	})
}

// Seed megazords
export async function seedMegazords() {
	const megazordsCollection = database.get("megazords")

	const existingCount = await megazordsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Megazords already seeded")
		return
	}

	await database.write(async () => {
		for (const megazord of megazordsData) {
			await megazordsCollection.create((record) => {
				record._raw.id = String(megazord.id)
				record.name = megazord.name
				record.slug = megazord.slug
				record.ability = megazord.ability
				record.expansionId = String(megazord.expansion_id)
				record.compatibleTeamIds = typeof megazord.compatible_team_ids === 'string' ? JSON.parse(megazord.compatible_team_ids) : megazord.compatible_team_ids
				record.published = megazord.published ?? false
			})
		}
		console.log(`✅ Seeded ${megazordsData.length} megazords`)
	})
}

// Seed ranger cards
export async function seedRangerCards() {
	const rangerCardsCollection = database.get("ranger_cards")

	const existingCount = await rangerCardsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Ranger cards already seeded")
		return
	}

	await database.write(async () => {
		for (const card of rangerCardsData) {
			await rangerCardsCollection.create((record) => {
				record._raw.id = String(card.id)
				record.name = card.name
				record.energyCost = card.energy_cost
				record.type = card.type
				record.description = card.description
				record.shields = card.shields
				record.attackDice = card.attack_dice;
				record.attackHit = card.attack_hit;
				record.expansionId = card.expansion_id ? String(card.expansion_id) : null;
				record.published = card.published ?? true;
			})
		}
		console.log(`✅ Seeded ${rangerCardsData.length} ranger cards`)
	})
}

// Seed arsenal cards
export async function seedArsenalCards() {
	const arsenalCardsCollection = database.get("arsenal_cards")

	const existingCount = await arsenalCardsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Arsenal cards already seeded")
		return
	}

	await database.write(async () => {
		for (const card of arsenalCardsData) {
			await arsenalCardsCollection.create((record) => {
				record._raw.id = String(card.id)
				record.name = card.name
				record.energyCost = card.energy_cost
				record.type = card.type
				record.description = card.description
				record.shields = card.shields
				record.attackDice = card.attack_dice;
				record.attackHit = card.attack_hit;
				record.expansionId = card.expansion_id ? String(card.expansion_id) : null;
				record.published = card.published ?? true;
			})
		}
		console.log(`✅ Seeded ${arsenalCardsData.length} arsenal cards`)
	})
}

// Seed tags
export async function seedTags() {
	const tagsCollection = database.get("tags")

	const existingCount = await tagsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Tags already seeded")
		return
	}

	await database.write(async () => {
		for (const tag of tagsData) {
			await tagsCollection.create((record) => {
				record._raw.id = String(tag.id)
				record.name = tag.name
				record.slug = tag.slug
				record.published = tag.published ?? false
			})
		}
		console.log(`✅ Seeded ${tagsData.length} tags`)
	})
}

// Seed locations
export async function seedLocations() {
	const locationsCollection = database.get("locations")

	const existingCount = await locationsCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Locations already seeded")
		return
	}

	await database.write(async () => {
		for (const location of locationsData) {
			await locationsCollection.create((record) => {
				record._raw.id = String(location.id)
				record.name = location.name
				record.slug = location.slug
				record.published = location.published ?? false
			})
		}
		console.log(`✅ Seeded ${locationsData.length} locations`)
	})
}

// Seed rulebooks from markdown files
export async function seedRulebooks() {
	const rulebooksCollection = database.get("rulebooks")

	// Check if already seeded
	const existingCount = await rulebooksCollection.query().fetchCount()
	if (existingCount > 0) {
		console.log("Rulebooks already seeded")
		return
	}

	// Fetch markdown files
	const rulebooks = [
		{
			slug: "official-rulebook",
			file: "/content/rulebooks/official-rulebook.md",
		},
		{
			slug: "faq",
			file: "/content/rulebooks/faq.md",
		},
	]

	await database.write(async () => {
		for (const book of rulebooks) {
			try {
				const response = await fetch(book.file)
				const text = await response.text()
				const { name, content } = parseMD(text)

				await rulebooksCollection.create((rulebook) => {
					rulebook._raw.slug = book.slug
					rulebook._raw.name = name || book.slug
					rulebook._raw.content = content
					rulebook._raw.published = false
				})

				console.log(`✅ Seeded rulebook: ${name}`)
			} catch (error) {
				console.error(`Error seeding ${book.slug}:`, error)
			}
		}
	})
}

// Reset database (clear all data)
export async function resetDatabase() {
	console.log("Resetting database...")

	await database.write(async () => {
		const collections = [
			"seasons",
			"expansions",
			"teams",
			"rangers",
			"enemies",
			"zords",
			"megazords",
			"ranger_cards",
			"arsenal_cards",
			"tags",
			"locations",
			"rulebooks",
		]

		for (const collectionName of collections) {
			const collection = database.get(collectionName)
			const records = await collection.query().fetch()
			for (const record of records) {
				await record.destroyPermanently()
			}
		}
	})

	console.log("✅ Database reset complete")
}

// Initialize database with seed data
export async function initializeDatabase() {
	// Return existing promise if already initializing
	if (initializationPromise) {
		return initializationPromise
	}

	// Create and store initialization promise
	initializationPromise = (async () => {
		try {
			console.log("🔄 Initializing database...")

			// Seed in dependency order
			await seedSeasons()
			await seedExpansions()
			await seedTeams()
			await seedTags()
			await seedLocations()
			await seedRangers()
			await seedEnemies()
			await seedZords()
			await seedMegazords()
			await seedRangerCards()
			await seedArsenalCards()
			await seedRulebooks()

			// Verify and log counts
			console.log("\n📊 Database Verification:")
			const collections = [
				"seasons",
				"expansions",
				"teams",
				"rangers",
				"enemies",
				"zords",
				"megazords",
				"ranger_cards",
				"arsenal_cards",
				"tags",
				"locations",
				"rulebooks",
			]

			const counts = {}
			for (const collectionName of collections) {
				const collection = database.get(collectionName)
				const count = await collection.query().fetchCount()
				counts[collectionName] = count
			}

			console.table(counts)

			// Sample data from all tables
			console.log("\n🔍 Sample Data Verification:\n")

			// Season
			const seasons = await database.get("seasons").query().fetch()
			if (seasons[0]) {
				console.log(
					"Season:",
					JSON.stringify(
						{
							name: seasons[0].name,
							order: seasons[0].order,
							slug: seasons[0].slug,
						},
						null,
						2
					)
				)
			}

			// Expansion
			const expansions = await database.get("expansions").query().fetch()
			if (expansions[0]) {
				console.log(
					"Expansion:",
					JSON.stringify(
						{ name: expansions[0].name, slug: expansions[0].slug },
						null,
						2
					)
				)
			}

			// Team
			const teams = await database.get("teams").query().fetch()
			if (teams[0]) {
				console.log(
					"Team:",
					JSON.stringify(
						{
							name: teams[0].name,
							slug: teams[0].slug,
							generation: teams[0].generation,
							seasonId: teams[0].seasonId,
						},
						null,
						2
					)
				)
			}

			// Ranger (with relationships)
			const rangers = await database.get("rangers").query().fetch()
			if (rangers[0]) {
				try {
					const team = await rangers[0].team.fetch()
					const expansion = await rangers[0].expansion.fetch()
					console.log(
						"Ranger:",
						JSON.stringify(
							{
								name: rangers[0].name,
								slug: rangers[0].slug,
								color: rangers[0].color,
								abilityName: rangers[0].abilityName,
								team: team.name,
								expansion: expansion.name,
								deckCards: rangers[0].deck.length,
								tags: rangers[0].tags.length,
							},
							null,
							2
						)
					)
				} catch (e) {
					console.warn("⚠️ Ranger relationship error:", e)
				}
			}

			// Enemy
			const enemies = await database.get("enemies").query().fetch()
			if (enemies[0]) {
				console.log(
					"Enemy:",
					JSON.stringify(
						{
							name: enemies[0].name,
							slug: enemies[0].slug,
							monsterType: enemies[0].monsterType,
							deckCards: enemies[0].deck.length,
							locations: enemies[0].locations.length,
						},
						null,
						2
					)
				)
			}

			// Zord
			const zords = await database.get("zords").query().fetch()
			if (zords[0]) {
				console.log(
					"Zord:",
					JSON.stringify(
						{
							name: zords[0].name,
							slug: zords[0].slug,
							subcategory: zords[0].subcategory,
							compatibleRangers: zords[0].compatibleRangerIds.length,
							compatibleTeams: zords[0].compatibleTeamIds.length,
						},
						null,
						2
					)
				)
			}

			// Megazord
			const megazords = await database.get("megazords").query().fetch()
			if (megazords[0]) {
				console.log(
					"Megazord:",
					JSON.stringify(
						{
							name: megazords[0].name,
							slug: megazords[0].slug,
							compatibleTeams: megazords[0].compatibleTeamIds.length,
						},
						null,
						2
					)
				)
			}

			// Ranger Card
			const rangerCards = await database.get("ranger_cards").query().fetch()
			if (rangerCards[0]) {
				console.log(
					"Ranger Card:",
					JSON.stringify(
						{
							name: rangerCards[0].name,
							type: rangerCards[0].type,
							energyCost: rangerCards[0].energyCost,
							shields: rangerCards[0].shields,
						},
						null,
						2
					)
				)
			}

			// Arsenal Card
			const arsenalCards = await database.get("arsenal_cards").query().fetch()
			if (arsenalCards[0]) {
				console.log(
					"Arsenal Card:",
					JSON.stringify(
						{
							name: arsenalCards[0].name,
							type: arsenalCards[0].type,
							energyCost: arsenalCards[0].energyCost,
						},
						null,
						2
					)
				)
			}

			// Tag
			const tags = await database.get("tags").query().fetch()
			if (tags[0]) {
				console.log(
					"Tag:",
					JSON.stringify({ name: tags[0].name, slug: tags[0].slug }, null, 2)
				)
			}

			// Location
			const locations = await database.get("locations").query().fetch()
			if (locations[0]) {
				console.log(
					"Location:",
					JSON.stringify(
						{ name: locations[0].name, slug: locations[0].slug },
						null,
						2
					)
				)
			}

			// Rulebook
			const rulebooks = await database.get("rulebooks").query().fetch()
			if (rulebooks[0]) {
				console.log(
					"Rulebook:",
					JSON.stringify(
						{ name: rulebooks[0].name, slug: rulebooks[0].slug },
						null,
						2
					)
				)
			}

			console.log("\n✅ Database initialized successfully")
		} catch (error) {
			console.error("❌ Error initializing database:", error)
			throw error
		}
	})()

	return initializationPromise
}

export default initializeDatabase

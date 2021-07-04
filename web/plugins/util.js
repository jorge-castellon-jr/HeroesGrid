import Vue from "vue"

export default (context, inject) => {
	const getColor = c => {
		// if no color was found Default to gray
		if (!c) return `bg-gray-500`

		let color = c.toLowerCase()
		// Main Colors
		if (color == "red") return "bg-red-600"
		if (color == "blue") return "bg-blue-500"
		if (color == "pink") return "bg-pink-500"
		if (color == "green") return "bg-green-500"
		if (color == "black") return "bg-gray-900"
		if (color == "yellow") return "bg-yellow-300 text-yellow-900"

		// Special Colors
		if (color == "white") return "bg-gray-100 text-gray-800"
		if (color == "gold") return "bg-yellow-400"
		if (color == "shadow") return "bg-blue-200 text-blue-900"
		if (color == "purple") return "bg-purple-600"
		if (color == "orange") return "bg-yellow-600"

		// Enemies
		if (color == "soldier") return "bg-green-200"
		if (color == "monster") return "bg-orange-400"
		if (color == "boss") return "bg-pink-700"

		// if no color was found Default to gray
		return `bg-gray-500`
	}

	const friendlyURL = text => {
		return text.toLowerCase().replace(" ", "-")
	}

	const dashToSpace = text => {
		return text
			.split("-")
			.map(s => s.charAt(0).toUpperCase() + s.substring(1))
			.join(" ")
	}

	const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

	const getQuery = (type, variable) => {
		switch (type) {
			case "allData":
				return `{
					"rangers": *[_type == 'ranger'] {
						_id,
						name,
						abilityName,
						abilityDesc,
						color,
						'imageUrl': image.asset->url,
						'team': team->name,
						'slug': slug.current,
						'teamPosition': teamPosition.current,
						"expansion": expansion._ref
					},
					"expansions": *[_type == 'expansion' && phase < '3' && 'ranger' in type[]] {
						_id,
						name,
						phase,
						'imageUrl': image.asset->url,
					} | order(phase asc),
					"zords": *[_type == 'zord'] {
						_id,
						name,
						ability,
					},
					"megazords": *[_type == 'megazord'] {
						_id,
						name,
						ability,
					},
				}`

			case "allRangers":
				return `
					*[_type == 'ranger'] {
						_id,
						name,
						abilityName,
						abilityDesc,
						color,
						'imageUrl': image.asset->url,
						'team': team->name,
						'gen': team->gen,
						'slug': slug.current,
						'teamPosition': teamPosition.current
					} | order(gen asc, order asc)
				`
			case "singleRanger":
				return `
					*[_type == 'ranger' && slug.current == '${variable}'] {
						_id,
						name,
						abilityName,
						abilityDesc,
						color,
						'zords': zords[]->,
						'imageUrl': image.asset->url,
						'team': team->name,
						'slug': slug.current,
						'teamPosition': teamPosition.current,
						'deck': Deck[],
						'similar': *[_type == 'ranger' && color.title == ^.color.title && _id != ^._id] {
							...,
							'imageUrl': image.asset->url,
							'team': team->name,
							'slug': slug.current,
							'teamPosition': teamPosition.current
						}
					}[0]
				`

			case "allTeams":
				return `
					*[_type == 'team'] | order(gen asc)
				`
			case "rangersByColor":
				return `
					*[_type == 'ranger' && color.title == '${variable}'] {
						_id,
						name,
						abilityName,
						abilityDesc,
						color,
						'imageUrl': image.asset->url,
						'team': team->name,
						'slug': slug.current,
						'teamPosition': teamPosition.current,
					}
				`
			case "teamRangers":
				return `
					*[_type == 'team' && slug.current == '${variable}'] {
						name,
						"rangers": *[_type == 'ranger' && team._ref == ^._id] {
							name,
							abilityName,
							color,
							'team': team->name,
							'slug': slug.current,
							'teamPosition': teamPosition.current,
						}
					}[0]
				`

			default:
				break
		}
	}

	inject("getColor", getColor)
	inject("friendlyURL", friendlyURL)
	inject("dashToSpace", dashToSpace)
	inject("random", random)
	inject("getQuery", getQuery)
}

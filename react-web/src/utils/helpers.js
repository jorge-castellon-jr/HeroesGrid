export const getColor = (c) => {
	if (!c) return `bg-gray-500`
	let color = c.toLowerCase()

	switch (color) {
		// Main Colors
		case "red":
			return "bg-red-500"
		case "blue":
			return "bg-blue-400"
		case "pink":
			return "bg-pink-500"
		case "green":
			return "bg-green-500"
		case "black":
			return "bg-gray-900"
		case "yellow":
			return "bg-yellow-300 text-yellow-900"

		// Special Colors
		case "white":
			return "bg-bluegray-100 text-bluegray-800"
		case "gold":
			return "bg-yellow-600"
		case "silver":
			return "bg-gray-400"
		case "crimson":
			return "bg-red-800"
		case "shadow":
			return "bg-sky-300 text-blue-900"
		case "purple":
			return "bg-purple-600"
		case "orange":
			return "bg-orange-400"

		// Enemies
		case "soldier":
			return "bg-lime-300"
		case "monster":
			return "bg-orange-400"
		case "nemesis":
			return "bg-red-700"
		case "boss":
			return "bg-pink-800"

		default:
			// if no color was found Default to gray
			return `bg-gray-500`
	}
}

export const friendlyURL = (text) => {
	return text.toLowerCase().replace(" ", "-")
}

export const dashToSpace = (text) => {
	return text
		.split("-")
		.map(s => s.charAt(0).toUpperCase() + s.substring(1))
		.join(" ")
}

export const random = (min, max) => Math.floor(Math.random() * (max - min)) + min

export const getQuery = (type, variable) => {
	switch (type) {
		case "allData":
			return `{
				"rangerExpansions": *[_type == 'expansion' && phase < '3' && 'ranger' in type[]] {
					_id,
					name,
					phase,
					'image': image.asset->url,
				} | order(phase asc),
				"enemyExpansions": *[_type == 'expansion' && phase < '3' && ('minion' in type[] || 'nemesis' in type[] || 'monster' in type[] || 'boss' in type[])] {
					_id,
					name,
					phase,
					'image': image.asset->url,
				} | order(phase asc),
				
				"rangers": *[_type == 'ranger'] {
					_id,
					name,
					rangerInfo {
						...,
						'color': color.title,
						'slug': slug.current,
						'team': team->name,
						"expansion": expansion._ref,
						'teamPosition': teamPosition.current
					},
					rangerCards {
						...,
						'image': image.asset->url,
						zords[]->
					},
				},
				"zords": *[_type == 'zord'] {
					_id,
					name,
					ability,
					"expansion": expansion._ref
				},
				"megazords": *[_type == 'megazord'] {
					_id,
					name,
					ability,
					"expansion": expansion._ref
				},
				"footSoldiers": *[_type == 'footsoldier'] {
					...,
					"expansion": expansion._ref,
					"image": image.asset->url
				},
				"monsters": *[_type == 'monster' || _type == 'nemesis'] {
					...,
					"expansion": expansion._ref,
					"image": image.asset->url
				},
				"masters": *[_type == 'master'] {
					...,
					"expansion": expansion._ref,
					"image": image.asset->url
				}
			}`

		case "allRangers":
			return `
				*[_type == 'ranger'] {
					_id,
					name,
					rangerInfo {
						...,
						'color': color.title,
						'slug': slug.current,
						'team': team->name,
						'teamPosition': teamPosition.current
					},
					rangerCards {
						...,
						'image': image.asset->url,
						zords[]->
					},
					'gen': rangerInfo.team->gen,
				} | order(gen asc, rangerInfo.order asc)
			`
		case "singleRanger":
			return `
				*[_type == 'ranger' && rangerInfo.slug.current == '${variable}'] {
					_id,
					name,
					rangerInfo {
						...,
						'color': color.title,
						'slug': slug.current,
						'team': team->name,
						'teamPosition': teamPosition.current
					},
					rangerCards {
						...,
						'image': image.asset->url,
						zords[]->
					},

					'deck': Deck[],
				}[0]
			`

		case "allTeamsWithRangers":
			return `
				*[_type == 'team' && count(*[_type == 'ranger' && rangerInfo.team._ref == ^._id]) > 0] | order(gen asc)
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
					'image': image.asset->url,
					'team': team->name,
					'slug': slug.current,
					'teamPosition': teamPosition.current,
				}
			`
		case "teamRangers":
			return `
				*[_type == 'team' && slug.current == '${variable}'] {
					name,
					"rangers": *[_type == 'ranger' && rangerInfo.team._ref == ^._id] | order(rangerInfo.order asc) | {
						name,
						rangerInfo {
							...,
							'color': color.title,
							'slug': slug.current,
							'team': team->name,
							'teamPosition': teamPosition.current
						},
						rangerCards {
							...,
							'image': image.asset->url,
						},
					}
				}[0]
			`
		case "getRulebookSingle":
			return `
				*[_type == 'rulebook' && slug.current == '${variable}'] {
					...,
					"slug": slug.current
				} [0]
			`

		default:
			break
	}
}

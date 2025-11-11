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

import Vue from "vue"
import TransitionExpand from "vue-transition-expand"
import "vue-transition-expand/dist/vue-transition-expand.css"

Vue.use(TransitionExpand)

export default (context, inject) => {
	const getColor = color => {
		// Main Colors
		if (color == "red") return "bg-red-600"
		if (color == "blue") return "bg-blue-500"
		if (color == "pink") return "bg-pink-500"
		if (color == "green") return "bg-green-500"
		if (color == "black") return "bg-gray-900"
		if (color == "yellow") return "bg-yellow-400 text-yellow-900"

		// Special Colors
		if (color == "white") return "bg-gray-100 text-gray-800"
		if (color == "gold") return "bg-yellow-600"
		if (color == "shadow") return "bg-blue-200 text-blue-900"
		if (color == "purple") return "bg-purple-600"
		if (color == "orange") return "bg-orange-400"

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

	inject("getColor", getColor)
	inject("friendlyURL", friendlyURL)
	inject("dashToSpace", dashToSpace)
}

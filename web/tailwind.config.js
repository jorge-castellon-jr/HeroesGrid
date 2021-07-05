/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
const colors = require("tailwindcss/colors")

module.exports = {
	theme: {
		colors: {
			transparent: "transparent",
			current: "currentColor",
			black: colors.black,
			white: colors.white,
			gray: colors.coolGray,
			indigo: colors.indigo,
			red: colors.red,
			yellow: colors.yellow,
			amber: colors.amber,
			green: colors.emerald,
			blue: colors.blue,
			purple: colors.violet,
			orange: colors.orange,
			pink: colors.pink,
			lime: colors.lime,
		},
	},
	variants: {},
	plugins: [],
	purge: {
		// Learn more on https://tailwindcss.com/docs/controlling-file-size/#removing-unused-css
		enabled: process.env.NODE_ENV === "production",
		content: [
			"components/**/*.vue",
			"layouts/**/*.vue",
			"pages/**/*.vue",
			"pages/**/**/*.vue",
			"plugins/**/*.js",
			"nuxt.config.js",
		],
	},
}

export default {
	/*
	 ** Nuxt rendering mode
	 ** See https://nuxtjs.org/api/configuration-mode
	 */
	mode: "universal",
	/*
	 ** Headers of the page
	 ** See https://nuxtjs.org/api/configuration-head
	 */
	head: {
		title: "Heroes Grid | Heroes of the Grid Companion App",
		meta: [
			{ charset: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{ name: "msapplication-TileColor", content: "#00aba9" },
			{ name: "theme-color", content: "#ffffff" },
			{
				hid: "description",
				name: "description",
				content: process.env.npm_package_description || "",
			},
		],
		link: [
			{
				rel: "apple-touch-icon",
				size: "180x180",
				href: "/favicon/apple-touch-icon.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "32x32",
				href: "/favicon/favicon-32x32.png",
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "16x16",
				href: "/favicon/favicon-16x16.png",
			},
			{ rel: "manifest", href: "/favicon/site.webmanifest" },
			{ rel: "mask-icon", href: "/safari-pinned-tab.svg", color: "#5bbad5" },
			{ rel: "icon", type: "image/x-icon", href: "/favicon/favicon.ico" },
		],
	},
	env: {
		SANITY_PROJECT_ID: process.env.NUXT_PUBLIC_SANITY_PROJECT_ID,
		VERSION_NUMBER: "1.1.0",
	},
	router: {
		middleware: ["vuex"],
	},
	/*
	 ** Global CSS
	 */
	css: ["~/assets/scss/index.scss"],
	/*
	 ** Plugins to load before mounting the App
	 ** https://nuxtjs.org/guide/plugins
	 */
	plugins: [
		"~/plugins/util.js",
		"~/plugins/sanityClient.js",
		"~/plugins/route.js",
	],
	/*
	 ** Nuxt.js dev-modules
	 */
	buildModules: [
		// Doc: https://github.com/nuxt-community/nuxt-tailwindcss
		"@nuxtjs/tailwindcss",
		// 'nuxt-vite'
	],
	tailwindcss: {
		cssPath: "~/assets/scss/index.scss",
	},
	/*
	 ** Nuxt.js modules
	 */
	modules: [
		"@nuxtjs/pwa",
		// Doc: https://github.com/nuxt/content
		"@nuxt/content",
	],
	// vite: {
	//   css: {
	//     preprocessorOptions: {
	//       scss: {
	//         additionalData: '@import "@/assets/scss/index.scss";',
	//       },
	//     },
	//   },
	// },
	/*
	 ** Content module configuration
	 ** See https://content.nuxtjs.org/configuration
	 */
	content: {},
	/*
	 ** Build configuration
	 ** See https://nuxtjs.org/api/configuration-build/
	 */
	build: {},
}

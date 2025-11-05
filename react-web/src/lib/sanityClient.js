import sanityClient from "@sanity/client"

const env = import.meta.env.MODE

const client = sanityClient({
	projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
	dataset: "production",
	useCdn: env === "development" ? false : true,
})

export default client

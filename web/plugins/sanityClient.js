import sanityClient from "@sanity/client"
const env = process.env.NODE_ENV

const client = sanityClient({
	// Find your project ID and dataset in `sanity.json` in your studio project
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: "production",
	useCdn: env == "development" ? false : true,
	// useCdn == true gives fast, cheap responses using a globally distributed cache.
	// Set this to false if your application require the freshest possible
	// data always (potentially slightly slower and a bit more expensive).
})

export default (context, inject) => {
	inject("sanityClient", client)
}

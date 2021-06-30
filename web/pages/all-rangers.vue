<template>
	<div>
		<h1 class="p-4 text-center">All Rangers</h1>

		<!-- <h2 class="p-4 text-center">From Sanity</h2>
		<transition-expand>
			<div v-if="sanityRangers.length" class="flex flex-wrap justify-around" id="rangersTeam">
				<nuxt-link
					:class="`no-underline px-3 py-6 md:px-6 w-1/2 flex ${
					i % 2 == 0 ? 'justify-end' : 'justify-start'
				}`"
					:to="`/${$friendlyURL(ranger.team.toLowerCase())}/${ranger.slug}`"
					v-for="(ranger, i) in sanityRangers"
					:key="i"
				>
					<RangerCard class="lg:max-w-lg" noDesc :ranger="ranger" sanity />
				</nuxt-link>
			</div>
		</transition-expand>

		<h2 class="p-4 text-center">From Content</h2>-->
		<div class="flex flex-wrap justify-around" id="rangersTeam">
			<nuxt-link
				:class="`no-underline px-3 py-6 md:px-6 w-1/2 flex ${
					i % 2 == 0 ? 'justify-end' : 'justify-start'
				}`"
				:to="`/${$friendlyURL(ranger.team.toLowerCase() + '/' + ranger.slug)}`"
				v-for="(ranger, i) in rangers"
				:key="i"
			>
				<RangerCard class="lg:max-w-lg" noDesc :ranger="ranger" />
			</nuxt-link>
		</div>
		<!-- #rangersTeam -->
	</div>
</template>

<script>
import { mapGetters } from "vuex"
import RangerCard from "~/components/RangerCard"
const query = `
  {
    "rangers": *[_type == 'ranger'] {
      _id,
      name,
      abilityName,
      abilityDesc,
      color,
      'imageUrl': image.asset->url,
      'team': team->season,
      'slug': slug.current
    }
  }
`
export default {
	name: "AllRangers",
	components: {
		RangerCard,
	},
	data() {
		return {
			sanityRangers: [],
		}
	},
	async fetch() {
		let fetch = await this.$sanityClient.fetch(query)
		this.sanityRangers = fetch.rangers
	},
	computed: {
		...mapGetters({
			rangers: "getRangers",
		}),
	},
	fetchOnServer: false,
}
</script>

<style lang="scss" scoped></style>
<template>
	<div>
		<h1 class="py-4 text-center">All Rangers</h1>

		<div v-if="sanityRangers.length" class="flex flex-wrap justify-around -mx-3" id="rangersTeam">
			<nuxt-link
				:class="`no-underline px-3 py-6 md:px-6 w-1/2 flex ${
					i % 2 == 0 ? 'justify-end' : 'justify-start'
				}`"
				:to="`/${$friendlyURL(ranger.team)}/${ranger.slug}`"
				v-for="(ranger, i) in sanityRangers"
				:key="i"
			>
				<RangerCard class="lg:max-w-lg" noDesc :ranger="ranger" sanity />
			</nuxt-link>
		</div>
		<!-- #rangersTeam -->
	</div>
</template>

<script>
import { mapGetters } from "vuex"
import RangerCard from "~/components/cards/RangerCard"

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
		let fetch = await this.$sanityClient.fetch(this.$getQuery("allRangers"))
		this.sanityRangers = fetch
		this.$store.commit("setLoadingState", false)
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

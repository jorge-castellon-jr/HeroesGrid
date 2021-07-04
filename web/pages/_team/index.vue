<template>
	<div class="flex flex-col">
		<nuxt-child v-if="$route.params.ranger" />
		<h2>{{team}} Rangers</h2>
		<div class="flex flex-wrap justify-around -mx-3" id="rangersTeam">
			<nuxt-link
				v-for="(ranger, i) in rangers"
				:key="i"
				:class="`no-underline px-3 py-6 md:px-6 w-1/2 flex ${
					i % 2 == 0 ? 'justify-end' : 'justify-start'
				}`"
				:to="`/${$friendlyURL(team + '/' + ranger.slug)}`"
			>
				<RangerCard class="lg:max-w-lg" noDesc :ranger="ranger" sanity />
			</nuxt-link>
		</div>
		<!-- #rangersTeam -->
	</div>
	<!-- root -->
</template>

<script>
import RangerCard from "~/components/cards/RangerCard"
import { mapGetters } from "vuex"

export default {
	name: "RangerTeam",
	components: {
		RangerCard,
	},
	data() {
		return {
			team: "",
			rangers: [],
		}
	},
	watch: {
		$route(newValue, oldValue) {
			this.fetchData()
		},
	},
	mounted() {
		this.fetchData()
	},
	methods: {
		async fetchData() {
			const { $store, $route, $sanityClient } = this
			let teamRangersFetch = await $sanityClient.fetch(
				this.$getQuery("teamRangers", $route.params.team),
			)
			this.rangers = teamRangersFetch.rangers
			this.team = teamRangersFetch.name
			setTimeout(() => $store.commit("setLoadingState", false), 500)
		},
	},
}
</script>

<style lang="scss" scoped></style>

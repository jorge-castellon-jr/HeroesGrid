<template>
	<div class="flex flex-col">
		<nuxt-child v-if="$route.params.ranger" />

		<div class="flex flex-wrap justify-around" id="rangersTeam">
			<nuxt-link
				:class="`no-underline px-3 py-6 md:px-6 w-1/2 flex ${
					i % 2 == 0 ? 'justify-end' : 'justify-start'
				}`"
				:to="`/${$friendlyURL(team.toLowerCase() + '/' + ranger.slug)}`"
				v-for="(ranger, i) in filterByTeam"
				:key="i"
			>
				<RangerCard class="lg:max-w-lg" noDesc :ranger="ranger" />
			</nuxt-link>
		</div>
		<!-- #rangersTeam -->
	</div>
	<!-- root -->
</template>

<script>
import RangerCard from "~/components/RangerCard"
import { mapGetters } from "vuex"

export default {
	name: "RangerTeam",
	components: {
		RangerCard,
	},
	data() {
		let team = this.$route.params.team
			.split("-")
			.map(s => s.charAt(0).toUpperCase() + s.substring(1))
			.join(" ")
		return {
			team: team,
		}
	},
	methods: {},
	computed: {
		...mapGetters({
			rangers: "getRangers",
		}),
		filterByTeam() {
			let team = this.rangers.filter(ranger => {
				return this.$friendlyURL(ranger.team) == this.$route.params.team
			})
			return team
		},
	},
}
</script>

<style lang="scss" scoped></style>

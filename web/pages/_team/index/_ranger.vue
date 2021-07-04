<template>
	<div v-if="ranger" class="max-w-3xl mx-auto ranger">
		<RangerCard class="mb-10" :ranger="ranger" sanity />

		<div v-if="ranger.deck" class="mb-10">
			<h2>Deck</h2>
			<div v-for="card in ranger.deck" :key="card._key">
				<RangerDeckSingle :card="card" />
			</div>
		</div>

		<div v-if="ranger.zords" class="mb-10">
			<h2>Zords</h2>
			<div v-for="zord in ranger.zords" :key="zord._key">
				<h3>{{zord.name}}</h3>
				<p>{{zord.ability}}</p>
			</div>
		</div>

		<nuxt-content :document="contentRanger" />

		<div v-if="similar.length">
			<h2>Similar Rangers</h2>
			<div class="flex flex-wrap">
				<nuxt-link
					v-for="(item, i) in similar"
					:key="i"
					:to="`/${$route.params.team}/${item.slug}`"
					:class="`p-6 shadow-lg rounded-lg my-4 mr-4 ${$getColor(
					item.color.title,
				)} text-white flex flex-col`"
				>
					<span>{{ item.name }}</span>
					<span>{{ item.teamPosition[0] == '*' ? item.teamPosition.replace(/\*/g, '') : `${item.teamPosition.replace(/-/g, '')} Ranger` }}</span>
				</nuxt-link>
			</div>
		</div>
	</div>
</template>

<script>
import RangerCard from "~/components/cards/RangerCard"
import RangerDeckSingle from "~/components/cards/RangerDeckSingle"
import { mapGetters } from "vuex"

export default {
	name: "Ranger",
	scrollToTop: true,
	components: {
		RangerCard,
		RangerDeckSingle,
	},
	data() {
		return {
			ranger: null,
			similar: [],
			contentRanger: null,
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
			let currentRangerFetch = await $sanityClient.fetch(
				this.$getQuery("singleRanger", $route.params.ranger),
			)

			let content = await $store.getters.getCurrentRanger($route.params.ranger)

			this.ranger = currentRangerFetch
			this.similar = currentRangerFetch.similar
			this.contentRanger = content
			setTimeout(() => $store.commit("setLoadingState", false), 500)
		},
	},
	computed: {
		...mapGetters({
			rangers: "getRangers",
		}),
		similarWOCurrent() {
			return (
				this.similar.filter(ranger => {
					return ranger.slug != this.$route.params.ranger
				}) || []
			)
		},
	},
}
</script>

<style lang="scss" scoped>
.ranger {
	animation: 1s appear;
}
</style>

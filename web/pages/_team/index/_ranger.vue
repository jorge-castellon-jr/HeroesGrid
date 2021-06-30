<template>
	<div class="max-w-3xl px-6 mx-auto ranger">
		<h2 class="p-2 text-center">From Sanity</h2>
		<!-- <RangerCard v-if="sanityRanger" class="mb-10" :ranger="sanityRanger" sanity /> -->

		<h2 class="p-2 text-center">Content</h2>
		<!-- <RangerCard v-if="ranger" class="mb-10" :ranger="ranger" /> -->
		<h2 v-if="similarWOCurrent.length">Similar Rangers</h2>
		<div v-if="similarWOCurrent.length" class="flex flex-wrap">
			<nuxt-link
				:to="`/${$route.params.team}/${item.slug}`"
				v-for="(item, i) in similarWOCurrent"
				:key="i"
				:class="`p-6 shadow-lg rounded-lg my-4 mr-4 ${$getColor(
					item.color,
				)} text-white flex flex-col`"
			>
				<span>{{ item.name }}</span>
				<span>{{ item.teamPosition }}</span>
			</nuxt-link>
		</div>
		<nuxt-content :document="ranger" />
	</div>
</template>

<script>
import RangerCard from "~/components/RangerCard"
import smoothReflow from "vue-smooth-reflow"
import { mapGetters } from "vuex"

export default {
	name: "Ranger",
	mixins: [smoothReflow],
	components: {
		RangerCard,
	},
	data() {
		return {
			ranger: {},
			sanityRanger: {},
			similar: [],
		}
	},
	async fetch() {
		const store = this.$store
		const params = this.$route.params
		const query = `
			{
				"ranger": *[_type == 'ranger' && slug.current == '${params.ranger}'] {
					_id,
					name,
					abilityName,
					abilityDesc,
					color,
					'imageUrl': image.asset->url,
					'team': team->season,
					'slug': slug.current
				}[0]
			}
		`

		let fetch = await this.$sanityClient.fetch(query)
		let ranger = await store.getters.getCurrentRanger(params.ranger)
		let similar = await store.getters.getSimilarRangers(ranger)

		this.ranger = ranger
		this.sanityRanger = fetch.ranger
		this.similar = similar
	},
	mounted() {
		this.$smoothReflow()
	},
	methods: {},
	computed: {
		similarWOCurrent() {
			return this.similar.filter(ranger => {
				return ranger.slug != this.$route.params.ranger
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.ranger {
	animation: 1s appear;
}
</style>

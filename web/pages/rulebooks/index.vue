<template>
	<div class="max-w-3xl px-4 mx-auto">
		<h2 class="text-center">All Rulebooks</h2>
		<div v-if="rulebooks" class="flex flex-wrap justify-around w-full max-w-5xl mx-auto ranger-teams">
			<nuxt-link
				v-for="(rulebook, i) in rulebooks"
				:key="i"
				:to="`/rulebooks/${rulebook.slug}`"
				class="w-2/5 my-6 md:w-1/5"
			>
				<div class="h-full overflow-hidden border border-gray-400 rounded-lg shadow-lg">
					<div
						:class="`h-48 w-full flex-none bg-cover bg-center ${$getColor()}`"
						:style="`background-image: url(/uploads/${rulebook.slug}.png)`"
					></div>
					<p
						class="items-center p-4 font-bold text-center text-gray-900 uppercase text-md"
					>{{ rulebook.name }}</p>
				</div>
			</nuxt-link>
		</div>
		<!-- #rangersTeam -->
	</div>
</template>

<script>
export default {
	name: "Rulebook",
	data() {
		return {
			rulebooks: [],
		}
	},
	// async asyncData({ $content }) {
	// 	const rulebooks = await $content("rulebooks").fetch()
	// 	return {
	// 		rulebooks: rulebooks,
	// 	}
	// },
	async mounted() {
		const rulebooks = await this.$content("rulebooks").fetch()
		this.rulebooks = rulebooks
		this.$store.commit("setLoadingState", false)
	},
	computed: {
		// getRulebook() {
		// 	let slug = this.$route.params.slug
		// 	if (slug)
		// 		return this.rulebooks.find(rulebook => {
		// 			return rulebook.slug == slug
		// 		})
		// 	return false
		// },
	},
}
</script>

<style lang="scss" scoped></style>

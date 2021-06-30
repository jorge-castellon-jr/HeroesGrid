<template>
	<div class="max-w-3xl mx-auto px-4">
		<nuxt-child v-if="getRulebook" :rulebook="getRulebook" />
		<h2 class="text-center">All Rulebooks</h2>
		<div
			class="
				flex
				w-full
				flex-wrap
				justify-around
				ranger-teams
				max-w-5xl
				mx-auto
			"
		>
			<nuxt-link
				v-for="(rulebook, i) in rulebooks"
				:key="i"
				:to="`/rulebooks/${rulebook.slug}`"
				class="w-2/5 my-6 md:w-1/5"
			>
				<div
					class="
						h-full
						shadow-lg
						border border-gray-400
						rounded-lg
						overflow-hidden
					"
				>
					<div
						:class="`h-48 w-full flex-none bg-cover bg-center ${$getColor()}`"
						:style="`background-image: url(/uploads/${rulebook.slug}.png)`"
					></div>
					<p
						class="
							text-md text-center
							p-4
							font-bold
							text-gray-900
							items-center
							uppercase
						"
					>
						{{ rulebook.name }}
					</p>
				</div>
			</nuxt-link>
		</div>
		<!-- #rangersTeam -->
	</div>
</template>

<script>
export default {
	name: "Rulebook",
	async asyncData({ $content }) {
		const rulebooks = await $content("rulebooks").fetch()
		return {
			rulebooks: rulebooks,
		}
	},
	computed: {
		getRulebook() {
			let slug = this.$route.params.slug

			if (slug)
				return this.rulebooks.find(rulebook => {
					return rulebook.slug == slug
				})

			return false
		},
	},
}
</script>

<style lang="scss" scoped></style>

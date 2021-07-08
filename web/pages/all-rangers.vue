<template>
	<div>
		<h1 class="py-4 text-center">All Rangers</h1>
		<transition name="fade">
			<div
				v-if="teamsDropdown || colorsDropdown"
				class="fixed inset-0 z-10 w-screen h-screen bg-gray-500 opacity-50"
				@click="closeDropdowns()"
			></div>
		</transition>

		<div class="relative flex items-center justify-end mb-4">
			<div class="pr-6">Filter:</div>
			<div class>
				<button class="relative z-20 w-32 mr-4 bg-white card content" @click="dropdownClick('teams')">
					Teams
					<strong v-if="checkedTeams.length">({{checkedTeams.length}})</strong>
				</button>
				<transition name="fade">
					<div v-if="teamsDropdown" class="dropdown content card">
						<div class="flex flex-wrap justify-center -mx-2">
							<button class="w-full m-2 card content" @click="resetFiltered()">Reset</button>
							<div v-for="team in teams" :key="team._id" class="flex w-1/2 p-2 md:w-1/4">
								<input
									type="checkbox"
									:id="team.slug.current"
									:value="team.name"
									v-model="checkedTeams"
									class="hidden"
								/>
								<label
									:for="team.slug.current"
									class="flex flex-col items-center justify-center w-full p-3 text-center transition-colors duration-300 border border-gray-200 rounded-lg shadow-lg cursor-pointer poin hover:bg-gray-200 checkbox"
								>{{ team.name }}</label>
							</div>
						</div>
					</div>
				</transition>
			</div>
			<div class>
				<button class="relative z-20 w-32 bg-white card content" @click="dropdownClick('colors')">
					Colors
					<strong v-if="checkedColors.length">({{checkedColors.length}})</strong>
				</button>
				<transition name="fade">
					<div v-if="colorsDropdown" class="dropdown content card">
						<div class="flex flex-wrap justify-center -mx-2">
							<button class="w-full m-2 card content" @click="resetFiltered()">Reset</button>
							<div v-for="(color, i) in colors" :key="i" class="flex w-1/2 h-32 p-2 md:w-1/4">
								<input
									type="checkbox"
									:id="color.title"
									:value="color.title"
									v-model="checkedColors"
									class="hidden"
								/>
								<label
									:for="color.title"
									class="flex flex-col items-center justify-center w-full p-3 font-semibold tracking-wider text-center transition-all duration-300 border border-gray-200 rounded-lg shadow-lg opacity-50 cursor-pointer hover:opacity-100 checkbox-colors"
									:class="color.text"
									:style="`background: ${color.value};`"
								>{{color.title}}</label>
							</div>
						</div>
					</div>
				</transition>
			</div>
		</div>

		<transition name="fade">
			<div v-if="filteredRangers.length" class="flex flex-wrap justify-around -mx-3" id="rangersTeam">
				<nuxt-link
					v-for="(ranger, i) in filteredRangers"
					:key="i"
					:class="`no-underline p-3 w-1/2 flex ${
					i % 2 == 0 ? 'justify-end' : 'justify-start'
				}`"
					:to="`/${ ranger.team ? $friendlyURL(ranger.team) : ''}/${ranger.slug}`"
				>
					<RangerCard class="lg:max-w-lg" noDesc :ranger="ranger" sanity />
				</nuxt-link>
			</div>
		</transition>
		<!-- #rangersTeam -->
	</div>
</template>

<script>
import RangerCard from "~/components/cards/RangerCard"

export default {
	name: "AllRangers",
	components: {
		RangerCard,
	},
	data() {
		return {
			rangers: [],
			teams: [],
			colors: [
				{ title: "Red", value: "#EF4444", text: "text-red-900" },
				{ title: "Blue", value: "#60A5FA", text: "text-blue-900" },
				{ title: "Black", value: "#1a202c", text: "text-gray-100" },
				{ title: "Yellow", value: "#f6e05e", text: "text-yellow-900" },
				{ title: "Pink", value: "#ed64a6", text: "text-pink-900" },
				{ title: "Green", value: "#48bb78", text: "text-green-900" },
				{ title: "White", value: "#f7fafc", text: "text-gray-900" },
				{ title: "Purple", value: "#805ad5", text: "text-purple-900" },
				{ title: "Orange", value: "#f6ad55", text: "text-orange-900" },
				{ title: "Silver", value: "#a0aec0", text: "text-gray-900" },
				{ title: "Gold", value: "#D97706", text: "text-orange-900" },
				// { title: "Crimson", value: "#991B1B", text: 'text-red-100' },
				{ title: "Shadow", value: "#7DD3FC", text: "text-sky-900" },
			],
			checkedTeams: [],
			checkedColors: [],
			colorsDropdown: false,
			teamsDropdown: false,
		}
	},
	async mounted() {
		let fetchRangers = await this.$sanityClient.fetch(
			this.$getQuery("allRangers"),
		)
		let fetchTeams = await this.$sanityClient.fetch(
			this.$getQuery("allTeamsWithRangers"),
		)
		this.rangers = fetchRangers
		this.teams = fetchTeams
		setTimeout(() => this.$store.commit("setLoadingState", false), 500)
	},
	methods: {
		dropdownClick(type) {
			if (type == "colors") {
				this.teamsDropdown = false
				this.colorsDropdown = !this.colorsDropdown
			}
			if (type == "teams") {
				this.colorsDropdown = false
				this.teamsDropdown = !this.teamsDropdown
			}
		},
		closeDropdowns() {
			this.teamsDropdown = false
			this.colorsDropdown = false
		},
		resetFiltered() {
			this.checkedTeams = []
			this.checkedColors = []
		},
	},
	computed: {
		filteredRangers() {
			let filtered = this.rangers

			if (this.checkedTeams.length && this.checkedColors.length) {
				filtered = filtered.filter(r => {
					let team = this.checkedTeams.find(t => t == r.team)
					let color = this.checkedColors.find(c => c == r.color.title)
					return team && color
				})
			}
			if (this.checkedTeams.length) {
				filtered = filtered.filter(r => {
					return this.checkedTeams.find(t => r.team == t)
				})
			}
			if (this.checkedColors.length) {
				filtered = filtered.filter(r => {
					return this.checkedColors.find(c => r.color.title == c)
				})
			}

			return filtered
		},
	},
}
</script>

<style lang="scss" scoped>
input:checked ~ .checkbox {
	@apply bg-gray-400;
}
input:checked ~ .checkbox-colors {
	@apply opacity-100;
}
.dropdown {
	@apply absolute right-0 bg-white w-72 z-20;
	top: 62px;

	@media screen and (min-width: theme("screens.md")) {
		width: 576px;
	}
}
</style>

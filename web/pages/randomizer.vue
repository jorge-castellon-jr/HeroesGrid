<template>
	<div class="max-w-screen-lg mx-auto">
		<h1>Randomizer</h1>

		<div class="flex justify-end px-4 -mx-4 overflow-hidden border-b">
			<button
				class="tab"
				:class="tabSelection == 'rangers' ? 'tab--open' : ''"
				@click="(tabSelection = 'rangers'),(error = false)"
			>Rangers</button>
			<button
				class="tab"
				:class="tabSelection == 'enemies' ? 'tab--open' : ''"
				@click="(tabSelection = 'enemies'),(error = false)"
			>Enemies</button>
		</div>

		<transition-group name="fade">
			<div v-if="tabSelection == 'rangers'" key="rangers">
				<h2>Rangers</h2>
				<p>Choose Expansion(s):</p>
				<div class="flex flex-wrap justify-center -mx-3 md:mx-auto">
					<div
						v-for="option in rangerExpansions"
						:key="option._id"
						class="flex w-1/2 p-2 md:w-1/3 lg:w-1/4"
					>
						<input
							type="checkbox"
							:id="option._id"
							:value="option._id"
							v-model="rangerCheckedOptions"
							class="hidden"
						/>
						<label
							:for="option._id"
							class="flex flex-col items-center justify-center w-full p-3 text-center transition-colors duration-300 border border-gray-200 rounded-lg shadow-lg cursor-pointer poin hover:bg-gray-200 checkbox"
						>
							<img class="w-2/5" :src="option.imageUrl" :alt="option.name" />
							{{ option.name }}
						</label>
					</div>
				</div>
				<div class="flex flex-col">
					<button
						class="p-4 mx-auto mt-6 transition-colors duration-300 card w-72 hover:bg-gray-300"
						@click="pickRanger()"
					>Pick a Random Ranger</button>
					<button
						class="p-4 mx-auto my-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
						@click="reset('rangers')"
					>Reset</button>
					<p v-if="error" class="text-center text-red-500">{{ errorMessage }}</p>
				</div>
				<div class="flex flex-wrap">
					<div
						class="flex py-3 md:py-6 md:w-1/2 md:p-4"
						v-for="ranger in chosenRangers"
						:key="ranger._id"
					>
						<RangerCard :ranger="ranger" sanity />
					</div>
				</div>
			</div>

			<div v-if="tabSelection == 'enemies'" key="enemies">
				<h2>Enemies</h2>
				<p>Choose Expansion(s):</p>
				<div class="flex flex-wrap justify-center -mx-3 md:mx-auto">
					<div
						v-for="option in enemyExpansions"
						:key="option._id"
						class="flex w-1/2 p-2 md:w-1/3 lg:w-1/4"
					>
						<input
							type="checkbox"
							:id="option._id"
							:value="option._id"
							v-model="enemyCheckedOptions"
							class="hidden"
						/>
						<label
							:for="option._id"
							class="flex flex-col items-center justify-center w-full p-3 text-center transition-colors duration-300 border border-gray-200 rounded-lg shadow-lg cursor-pointer poin hover:bg-gray-200 checkbox"
						>
							<img class="w-2/5" :src="option.imageUrl" :alt="option.name" />
							{{ option.name }}
						</label>
					</div>
				</div>
				<div class="flex flex-col">
					<button
						class="p-4 mx-auto mt-6 transition-colors duration-300 card w-72 hover:bg-gray-300"
						@click="pickFootSoldier()"
					>Random Foot Soldier</button>
					<button
						class="flex flex-col p-4 mx-auto mt-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
						@click="pickMonster()"
					>
						Random Monster
						<span class="text-xs text-gray-400">This includes Nemesis As Monsters</span>
					</button>
					<button
						class="flex flex-col p-4 mx-auto mt-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
						@click="pickMaster()"
					>
						Random Master
						<span class="text-xs text-gray-400">This includes Nemesis As Masters</span>
					</button>
					<button
						class="p-4 mx-auto my-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
						@click="reset('enemy')"
					>Reset</button>
					<p v-if="error" class="text-center text-red-500">{{ errorMessage }}</p>
				</div>

				<div v-if="chosenFootSoldiers.length > 0">
					<h3>Foot Soldiers</h3>

					<div class="flex flex-wrap -mx-2">
						<div
							class="flex w-1/2 p-2 py-3 md:py-6"
							v-for="footSoldier in chosenFootSoldiers"
							:key="footSoldier._id"
						>
							<EnemyCard :enemy="footSoldier" type="foot soldier" />
						</div>
					</div>
				</div>

				<div v-if="chosenMonsters.length > 0">
					<h3>Monsters</h3>

					<div class="flex flex-wrap -mx-2">
						<div class="flex w-1/2 p-2 py-3 md:py-6" v-for="monster in chosenMonsters" :key="monster._id">
							<EnemyCard :enemy="monster" type="monster" />
						</div>
					</div>
				</div>

				<div v-if="chosenMasters.length > 0">
					<h3>Master</h3>

					<div class="flex flex-wrap justify-center">
						<div class="flex w-full py-3 md:py-6" v-for="master in chosenMasters" :key="master._id">
							<EnemyCard :enemy="master" type="master" />
						</div>
					</div>
				</div>
			</div>
		</transition-group>
	</div>
</template>

<script>
import RangerCard from "~/components/cards/RangerCard"
import EnemyCard from "~/components/cards/EnemyCard"

export default {
	name: "Randomizer",
	components: {
		RangerCard,
		EnemyCard,
	},
	data() {
		return {
			tabSelection: "rangers",

			rangers: [],
			zords: [],
			megazords: [],
			footSoldiers: [],
			monsters: [],
			masters: [],

			rangerExpansions: [],
			enemyExpansions: [],

			rangerCheckedOptions: [],
			enemyCheckedOptions: [],

			chosenRangers: [],
			chosenFootSoldiers: [],
			chosenMonsters: [],
			chosenMasters: [],

			error: false,
			errorMessage: "",
		}
	},
	mounted() {
		this.fetchData()
	},
	methods: {
		async fetchData() {
			const { $store, $sanityClient } = this

			let rangersFetch = await $sanityClient.fetch(this.$getQuery("allData"))

			this.rangers = rangersFetch.rangers
			this.zords = rangersFetch.zords
			this.megazords = rangersFetch.megazords

			this.footSoldiers = rangersFetch.footSoldiers
			this.monsters = rangersFetch.monsters
			this.masters = rangersFetch.masters

			this.rangerExpansions = rangersFetch.rangerExpansions
			this.enemyExpansions = rangersFetch.enemyExpansions

			setTimeout(() => $store.commit("setLoadingState", false), 500)
		},
		pick(filtered, chosen, limit) {
			if (this.error) this.error = false
			if (chosen.length >= limit) {
				this.error = true
				this.errorMessage = "Limit Reached"
				return
			}
			if (!filtered.length) {
				this.error = true
				this.errorMessage = "Please Choose Option"
				return
			}

			let random = this.$random(0, filtered.length)
			let picked = filtered[random]
			let dup = chosen.find(r => r._id == picked._id)
			if (dup) picked = filtered[this.$random(0, filtered.length)]
			chosen.push(picked)
		},
		pickRanger() {
			this.pick(this.filteredRangers, this.chosenRangers, 6)
		},
		pickFootSoldier() {
			this.pick(this.filteredFootSoldiers, this.chosenFootSoldiers, 2)
		},
		pickMonster() {
			this.pick(this.filteredMonsters, this.chosenMonsters, 2)
		},
		pickMaster() {
			this.pick(this.filteredMasters, this.chosenMasters, 1)
		},
		reset(type) {
			switch (type) {
				case "rangers":
					this.chosenRangers = []
					this.rangerCheckedOptions = []
					break

				default:
					this.enemyCheckedOptions = []
					this.chosenFootSoldiers = []
					this.chosenMonsters = []
					this.chosenMasters = []
					break
			}
			this.error = false
		},
	},
	computed: {
		filteredRangers() {
			return this.rangers.filter(r => {
				return this.rangerCheckedOptions.find(o => o == r.expansion)
			})
		},
		filteredFootSoldiers() {
			return this.footSoldiers.filter(e => {
				return this.enemyCheckedOptions.find(o => o == e.expansion)
			})
		},
		filteredMonsters() {
			return this.monsters.filter(e => {
				return this.enemyCheckedOptions.find(o => o == e.expansion)
			})
		},
		filteredMasters() {
			return this.masters.filter(e => {
				return this.enemyCheckedOptions.find(o => o == e.expansion)
			})
		},
	},
}
</script>

<style lang="scss" scoped>
.tab {
	@apply px-6 pt-3 pb-5 rounded-t-lg transition-all duration-300;
	// transition: box-shadow 0.3s ease, border 0.3s ease;
	&--open {
		@apply border-t border-b-8 border-l border-r shadow-lg pb-3;
	}
}
input:checked ~ .checkbox {
	@apply bg-gray-400;
}
label {
	@apply relative;
	&:after {
		@apply absolute inset-0;
	}
}
</style>
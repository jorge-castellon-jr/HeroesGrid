<template>
	<div>
		<h2>Randomizer</h2>
		<div class="flex flex-col">
			<button
				class="p-4 mx-auto mt-6 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="reset()"
			>Reset</button>
			<button
				class="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="pickRanger()"
			>Pick a Random Ranger</button>
			<p v-if="limitReached" class="text-center text-red-500">Limit reached</p>
		</div>
		<div class="flex flex-wrap">
			<div
				class="flex py-3 md:py-6 md:w-1/2 md:px-6"
				v-for="ranger in chosenRangers"
				:key="ranger._id"
			>
				<RangerCard :ranger="ranger" sanity />
			</div>
		</div>
		<h2>Tokens</h2>
	</div>
</template>

<script>
import RangerCard from "~/components/cards/RangerCard"
export default {
	name: "Companion",
	components: {
		RangerCard,
	},
	data() {
		return {
			rangers: [],
			chosenRangers: [],
			limitReached: false,
		}
	},
	mounted() {
		this.fetchData()
	},
	methods: {
		async fetchData() {
			const { $store, $sanityClient } = this

			let rangersFetch = await $sanityClient.fetch(this.$getQuery("allRangers"))
			this.rangers = rangersFetch
			$store.commit("setLoadingState", false)
		},
		pickRanger() {
			if (this.chosenRangers.length > 5) return (this.limitReached = true)
			let random = this.random(0, this.rangers.length)
			let pickedRanger = this.rangers[random]
			let dupRanger = this.chosenRangers.find(r => r._id == pickedRanger._id)
			if (dupRanger)
				pickedRanger = this.rangers[this.random(0, this.rangers.length)]
			this.chosenRangers.push(pickedRanger)
		},
		reset() {
			this.chosenRangers = []
			this.limitReached = false
		},
		random: (min, max) => Math.floor(Math.random() * (max - min)) + min,
	},
}
</script>

<style lang="scss" scoped>
</style>
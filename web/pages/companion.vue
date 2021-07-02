<template>
	<div class="max-w-screen-lg mx-auto">
		<h2>Randomizer</h2>
		<p>Options:</p>
		<div class="flex flex-wrap justify-center -mx-3 md:mx-auto">
			<div
				v-for="option in expansions"
				:key="option._id"
				class="flex w-1/2 px-3 my-3 md:w-1/3 lg:w-1/4"
			>
				<input
					type="checkbox"
					:id="option._id"
					:value="option._id"
					v-model="checkedOptions"
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
				class="p-4 mx-auto mt-6 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="pickRanger()"
			>Pick a Random Ranger</button>
			<button
				class="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="reset()"
			>Reset</button>
			<p v-if="error" class="text-center text-red-500">{{ errorMessage }}</p>
		</div>
		<div class="flex flex-wrap">
			<div class="flex py-3 md:py-6 md:w-1/2 md:p-4" v-for="ranger in chosenRangers" :key="ranger._id">
				<RangerCard :ranger="ranger" sanity />
			</div>
		</div>
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
			expansions: [],
			zords: [],
			megazords: [],
			chosenRangers: [],
			checkedOptions: [],
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
			this.expansions = rangersFetch.expansions
			this.zords = rangersFetch.zords
			this.megazords = rangersFetch.megazords

			$store.commit("setLoadingState", false)
		},
		pickRanger() {
			if (this.error) this.error = false
			if (this.chosenRangers.length > 5)
				return (this.error = true), (this.errorMessage = "Limit Reached")
			if (!this.filteredRangers.length)
				return (this.error = true), (this.errorMessage = "Please Choose Option")

			let random = this.random(0, this.filteredRangers.length)
			let pickedRanger = this.filteredRangers[random]
			let dupRanger = this.chosenRangers.find(r => r._id == pickedRanger._id)
			if (dupRanger)
				pickedRanger =
					this.filteredRangers[this.random(0, this.filteredRangers.length)]
			this.chosenRangers.push(pickedRanger)
		},
		reset() {
			this.chosenRangers = []
			this.error = false
		},
		random: (min, max) => Math.floor(Math.random() * (max - min)) + min,
	},
	computed: {
		filteredRangers() {
			return this.rangers.filter(r => {
				return this.checkedOptions.find(o => o == r.expansion)
			})
		},
	},
}
</script>

<style lang="scss" scoped>
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
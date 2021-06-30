<template>
	<div class="max-w-md mx-4 sm:mx-auto">
		<div class="mb-8">
			<h1>Countdown</h1>
		</div>
		<div class="flex items-center justify-between mb-6 selection">
			<div class="flex-1 label">Select Difficulty</div>
			<div class="relative flex-1">
				<button
					@click="selectedOpen = !selectedOpen"
					class="w-full p-3 py-2 text-left bg-white border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
				>{{ selectedDifficulty }}</button>
				<div
					class="absolute w-full mt-2 overflow-hidden transition-opacity duration-300 bg-white border border-gray-400 rounded-lg shadow-lg cursor-pointer"
					:class="selectedOpen ? 'opacity-100 ' : 'opacity-0 pointer-events-none'"
				>
					<div
						class="p-3 hover:bg-gray-200"
						v-for="difficulty in difficulties"
						:key="difficulty"
						@click="difficultySelected(difficulty)"
					>{{ difficulty }}</div>
				</div>
			</div>
		</div>
		<div class="flex flex-col enemies space-between">
			<div class="mb-4 label">How Many Enemies</div>
			<div class="flex flex-wrap justify-between">
				<div class="w-1/4 my-4" v-for="enemy in 8" :key="enemy">
					<button
						class="px-8 py-10 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg hover:bg-gray-300"
						:class="enemy <= enemyCount ? enemy <= 4 ? 'bg-gray-400' : 'bg-orange-300' : ''"
						@click="enemyCount = enemy"
					>{{ enemy }}</button>
				</div>
			</div>
		</div>
		<Counter :startTime="timeBaseOnDifficutly" />
	</div>
</template>

<script>
import Counter from "@/components/Counter.vue"

export default {
	components: {
		Counter,
	},
	data() {
		return {
			selectedOpen: false,
			difficulties: ["Easy", "Normal", "Hard"],
			selectedDifficulty: "Normal",
			enemyCount: 1,
		}
	},
	methods: {
		difficultySelected(difficulty) {
			this.selectedDifficulty = difficulty
			this.selectedOpen = false
		},
	},
	computed: {
		timeBaseOnDifficutly() {
			let min = 60000
			switch (this.selectedDifficulty) {
				case "Easy":
					return min * 1.25 * this.enemyCount
				case "Hard":
					return min * 0.75 * this.enemyCount

				default:
					return min * this.enemyCount
			}
		},
	},
}
</script>

<style lang="scss" scoped>
</style>
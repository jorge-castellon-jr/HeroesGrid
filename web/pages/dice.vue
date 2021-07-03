<template>
	<div class="max-w-md px-4 mx-auto">
		<h1>Dice Roller</h1>
		<h2 class="mb-6">How many dice?</h2>
		<div class="flex flex-wrap justify-center">
			<div class="flex justify-center w-1/4 my-2" v-for="die in 12" :key="`option-${die}`">
				<button
					class="self-center transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-14 h-14 md:w-20 md:h-20 hover:bg-gray-300"
					:class="die <= dieCount ? die >= 9 ? 'bg-red-400' : die <= 4 ? 'bg-gray-400' : 'bg-yellow-200' : ''"
					@click="dieCount = die"
				>{{ die }}</button>
			</div>
		</div>

		<div class="flex flex-col">
			<button
				class="p-4 mx-auto mt-6 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="rollDice()"
			>{{ rolledDice.length ? "Reroll Dice": 'Roll Dice'}}</button>
			<button
				class="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="reset()"
			>Reset</button>
			<p v-if="error" class="text-center text-red-500">{{ errorMessage }}</p>
		</div>

		<div v-if="rolledDice.length">
			<h2 class="mb-6">
				Rolled Dice
				<span v-if="rerolled > 1">x {{rerolled}}</span>
			</h2>
			<div class="flex flex-wrap justify-center">
				<div class="flex justify-center w-1/4 my-2" v-for="(die, i) in rolledDice" :key="`rolled-${i}`">
					<Die :number="die" />
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import Die from "@/components/gameComponents/Die.vue"

export default {
	name: "DiceRoller",
	components: {
		Die,
	},
	data() {
		return {
			dieCount: 0,
			rolledDice: [],
			rerolled: 0,
			error: false,
			errorMessage: "",
		}
	},
	mounted() {
		setTimeout(() => this.$store.commit("setLoadingState", false), 500)
	},
	methods: {
		rollDice() {
			if (this.error) this.error = false
			if (!this.dieCount)
				return (
					(this.error = true),
					(this.errorMessage = "Choose an amount of Dice to roll")
				)

			if (this.rolledDice) {
				this.rolledDice = []
				this.rerolled += 1
			}
			for (let i = 0; i < this.dieCount; i++) {
				let random = this.$random(1, 7)

				this.rolledDice.push(random)
			}
		},
		reset() {
			this.rolledDice = []
			this.dieCount = 0
			this.rerolled = 0
			this.error = false
		},
	},
}
</script>

<style lang="scss" scoped>
</style>
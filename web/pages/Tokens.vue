<template>
	<div class="max-w-md px-4 mx-auto">
		<h2 class="mb-6">Token Tracker</h2>
		<div class="flex items-center justify-center mb-6">
			<div>
				<button class="button" @click="minus()">-</button>
			</div>
			<div class="relative flex items-center justify-center w-32 h-32 mx-6">
				<div class="count">{{energyCount}}</div>
				<div class="bg"></div>
			</div>
			<div>
				<button class="button" @click="add()">+</button>
			</div>
		</div>
		<div class="flex flex-col">
			<button
				class="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
				@click="reset()"
			>Reset</button>
			<p v-if="error" class="text-center text-red-500">{{ errorMessage }}</p>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			energyCount: 3,
			error: false,
			errorMessage: "",
		}
	},
	mounted() {
		setTimeout(() => this.$store.commit("setLoadingState", false), 500)
	},
	methods: {
		minus() {
			if (this.energyCount == 0)
				return (
					(this.error = true), (this.errorMessage = "Energy cannot go below 0")
				)

			this.error = false
			this.energyCount -= 1
		},
		add() {
			this.error = false
			this.energyCount += 1
		},
		reset() {
			this.energyCount = 3
			this.error = false
		},
	},
}
</script>

<style lang="scss" scoped>
.button {
	@apply flex justify-center p-4 my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-14;
	&:hover {
		@apply bg-gray-300;
	}
}
.bg {
	@apply bg-blue-700 rounded-full opacity-80  h-full w-full absolute;
	filter: blur(30px);
}
.count {
	@apply text-6xl relative z-10 text-yellow-400;
}
</style>
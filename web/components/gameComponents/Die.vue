<template>
	<div
		class="flex items-center justify-center border border-gray-400 rounded-lg shadow-lg w-14 h-14 md:w-20 md:h-20"
	>{{symbol}}</div>
</template>

<script>
export default {
	props: {
		number: {
			type: [Number, String],
			default: 1,
		},
	},
	computed: {
		symbol() {
			let symbol
			if (this.number == 1 || this.number == 6) symbol = "O"
			if (this.number == 2 || this.number == 4 || this.number == 5) symbol = "X"
			if (this.number == 3) symbol = "X X"
			return symbol
		},
	},
}
</script>

<style lang="scss" scoped>
</style>
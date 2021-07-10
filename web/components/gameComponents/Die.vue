<template>
	<div
		class="flex items-center justify-around w-16 h-16 p-2 border border-gray-400 rounded-lg shadow-lg md:w-20 md:h-20"
		v-html="symbol"
	></div>
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
			if (this.number == 1 || this.number == 6)
				symbol = this.$changeIcon("[MISS]")
			if (this.number == 2 || this.number == 4 || this.number == 5)
				symbol = this.$changeIcon("[DAMAGE]")
			if (this.number == 3) symbol = this.$changeIcon("[DAMAGE][DAMAGE]")
			return symbol
		},
	},
}
</script>

<style lang="scss" scoped>
</style>
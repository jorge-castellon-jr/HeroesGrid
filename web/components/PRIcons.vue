<template>
	<svg :width="width" :height="height">
		<image
			:width="width"
			:height="height"
			v-bind:xlink:href="`/svg/${icon}.svg`"
			src="yourfallback.png"
		/>
	</svg>
</template>

<script>
export default {
	props: {
		icon: {
			type: String,
			default: "pr-hotg",
		},
		width: {
			type: [String, Number],
			default: 45,
		},
		height: {
			type: [String, Number],
			default: 45,
		},
	},
}
</script>

<style lang="scss" scoped></style>

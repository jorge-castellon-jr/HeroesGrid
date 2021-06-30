<template>
	<svg width="45" height="45">
		<image
			width="45"
			height="45"
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
	},
}
</script>

<style lang="scss" scoped></style>

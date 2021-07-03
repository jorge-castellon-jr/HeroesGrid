<template>
	<div>
		<h2>Token Tracker</h2>
	</div>
</template>

<script>
export default {
	mounted() {
		setTimeout(() => this.$store.commit("setLoadingState", false), 500)
	},
}
</script>

<style lang="scss" scoped>
</style>
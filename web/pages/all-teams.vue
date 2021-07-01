<template>
	<RangerTeams :teams="teams" />
</template>

<script>
import { mapGetters } from "vuex"
import RangerTeams from "~/components/RangerTeams"

export default {
	components: {
		RangerTeams,
	},
	mounted() {
		this.$store.commit("setLoadingState", false)
	},
	computed: {
		...mapGetters({
			teams: "getTeams",
		}),
	},
}
</script>

<style lang="scss" scoped>
</style>
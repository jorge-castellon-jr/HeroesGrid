<template>
	<div class="container max-w-3xl p-4 mx-auto text-center">
		<h1 class="-mx-4">#1 Companion app for</h1>
		<logo />
		<nuxt-content :document="content" />
	</div>
</template>

<script>
import Logo from "~/components/layout/Logo"

export default {
	components: {
		Logo,
	},
	async asyncData({ $content, store }) {
		const homeContent = await $content("index").fetch()
		return {
			content: homeContent,
		}
	},
	mounted() {
		setTimeout(() => this.$store.commit("setLoadingState", false), 500)
	},
}
</script>

<style lang="scss"></style>

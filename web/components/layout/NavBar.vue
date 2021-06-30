<template>
	<nav class="fixed top-0 right-0 flex justify-end w-full">
		<div
			class="relative h-16 px-6 py-4 m-4 overflow-hidden bg-white rounded-full shadow-md"
			:class="quickOpen ? 'w-full' : 'w-48'"
		>
			<div class="absolute inset-0 flex items-center justify-start flex-grow-0 max-w-lg">
				<span class="px-4 text-sm text-gray-700" @click="quickOpen = !quickOpen">Quick Links</span>
				<a
					v-for="link in menu"
					:key="link.to"
					class="px-4 ml-2 font-bold text-gray-800 hover:text-blue-dark"
					:href="link.to"
				>{{ link.title }}</a>
			</div>
		</div>
	</nav>
</template>

<script>
export default {
	data() {
		return {
			quickOpen: false,
			menu: [
				{
					title: "Rangers",
					to: "#rangersTeam",
					nuxt: false,
				},
				{
					title: "Teams",
					to: "#allTeams",
					nuxt: false,
				},
			],
		}
	},
}
</script>

<style lang="sass" scoped></style>

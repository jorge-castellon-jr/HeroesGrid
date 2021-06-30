<template>
	<div
		class="w-full shadow-lg border border-gray-400 rounded-lg overflow-hidden"
	>
		<div :class="`h-48 flex-none  ${$getColor(color)}`"></div>
		<div
			class="bg-white p-4 flex flex-col justify-between leading-normal w-full"
		>
			<span class="">
				<p class="text-md font-bold text-gray-900 items-center uppercase">
					{{ enemy.name }}
				</p>
				<p class="text-sm text-gray-600 flex items-center">
					{{ enemy.expansion }}
				</p>
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: "EnemyCard",
	props: {
		enemy: {
			type: Object,
			default: { name: "", teamPosition: "", abilityName: "", abilityDesc: "" },
		},
		color: {
			type: String,
		},
	},
	methods: {},
}
</script>

<style lang="scss" scoped></style>

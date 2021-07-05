<template>
	<div class="w-full overflow-hidden border card lg:flex">
		<div :class="`lg:h-auto lg:w-48 flex-none  ${enemyColor}`">
			<img class="p-4 mx-auto max-h-48 md:full h-" v-if="enemy.image" :src="enemy.image" />
		</div>

		<div class="flex flex-col justify-between w-full leading-normal bg-white content md:p-4">
			<span class>
				<p class="items-center font-bold text-gray-900 uppercase text-md">{{ enemy.name }}</p>
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: "RangerCard",
	props: {
		enemy: {
			type: Object,
			default: {
				name: "",
				teamPosition: "",
				abilityName: "",
				abilityDesc: "",
				color: "",
			},
		},
		type: {
			type: String,
			default: "foot soldier",
		},
	},
	methods: {},
	computed: {
		enemyColor() {
			switch (this.type.toLowerCase()) {
				case "monster":
					return "bg-orange-400"
				case "master":
					return "bg-pink-800"

				default:
					return "bg-lime-300"
			}
			return this.enemy.color
		},
	},
}
</script>

<style lang="scss" scoped></style>

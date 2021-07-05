<template>
	<div class="w-full overflow-hidden border card lg:flex">
		<div
			:class="`lg:h-auto lg:w-48 flex-none  ${$getColor(rangerColor)} ${ranger.imageUrl ? '' : 'custom-height'}`"
		>
			<img
				class="p-4 mx-auto rounded-full max-h-48 md:full h-"
				v-if="ranger.imageUrl"
				:src="ranger.imageUrl"
			/>
		</div>

		<div class="flex flex-col justify-between w-full leading-normal bg-white content md:p-4">
			<span class>
				<p class="items-center font-bold text-gray-900 uppercase text-md">{{ ranger.name }}</p>
				<p
					class="flex items-center text-sm text-gray-600"
				>{{ ranger.teamPosition[0] == '*' ? ranger.teamPosition.replace(/\*/g, '') : `${ranger.teamPosition.replace(/-/g, '')} Ranger` }}</p>
				<div class="mb-2 text-xl font-bold text-gray-900">{{ ranger.abilityName }}</div>
				<p v-if="!noDesc" class="text-base text-gray-700">{{ ranger.abilityDesc }}</p>
			</span>
		</div>
	</div>
</template>

<script>
export default {
	name: "RangerCard",
	props: {
		ranger: {
			type: Object,
			default: {
				name: "",
				teamPosition: "",
				abilityName: "",
				abilityDesc: "",
				color: "",
			},
		},
		noDesc: {
			type: Boolean,
			default: false,
		},
		sanity: {
			type: Boolean,
			default: false,
		},
	},
	methods: {},
	computed: {
		rangerColor() {
			if (this.sanity) return this.ranger.color.title
			return this.ranger.color
		},
		teamPosition() {
			if (this.sanity) {
				return `${this.ranger.team} ${this.ranger.color.title}`
			}
			return this.ranger.teamPosition
		},
	},
}
</script>

<style lang="scss" scoped>
.custom-height {
	@apply max-h-48;
	height: 42.5vw;
}
</style>

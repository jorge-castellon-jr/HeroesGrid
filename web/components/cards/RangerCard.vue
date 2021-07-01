<template>
	<div class="w-full overflow-hidden border border-gray-400 rounded-lg shadow-lg lg:flex">
		<div :class="`h-48 lg:h-auto lg:w-48 flex-none  ${$getColor(rangerColor)}`"></div>
		<div class="flex flex-col justify-between w-full p-3 leading-normal bg-white md:p-4">
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

<style lang="scss" scoped></style>

<template>
	<div class="w-full overflow-hidden border card" :class="single ? 'sm:flex' : 'md:flex'">
		<div class="ranger__image" :class="customClasses">
			<img
				class="p-4 rounded-full max-h-48"
				v-if="ranger.rangerCards.image"
				:src="`${ranger.rangerCards.image}?h=${single ? '200' : '125'}`"
				:alt="ranger.name"
			/>
		</div>

		<div
			class="flex flex-col justify-between w-full leading-normal bg-white content"
			:class="single ? 'sm:p-2' : 'md:p-4'"
		>
			<span class>
				<p class="items-center font-bold text-gray-900 uppercase text-md">{{ ranger.name }}</p>
				<p
					class="flex items-center text-sm text-gray-600"
				>{{ ranger.rangerInfo.teamPosition[0] == '*' ? ranger.rangerInfo.teamPosition.replace(/\*/g, '') : `${ranger.rangerInfo.teamPosition.replace(/-/g, '')} Ranger` }}</p>
				<div class="mb-2 text-xl font-bold text-gray-900">{{ ranger.rangerCards.abilityName }}</div>
				<p v-if="!noDesc" class="text-base text-gray-700">{{ ranger.rangerCards.abilityDesc }}</p>
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
				rangerInfo: {
					color: "",
				},
				rangerCards: {},
			},
		},
		noDesc: {
			type: Boolean,
			default: false,
		},
		single: {
			type: Boolean,
			default: false,
		},
	},
	methods: {},
	computed: {
		rangerColor() {
			return this.ranger.rangerInfo.color
		},
		teamPosition() {
			return `${this.ranger.rangerInfo.team} ${this.ranger.rangerInfo.color}`
		},
		customClasses() {
			let classes = []

			if (this.single) classes.push("single")
			if (!this.ranger.rangerCards.image) classes.push("custom-height")

			classes.push(this.$getColor(this.rangerColor))

			return classes.join(" ")
		},
	},
}
</script>

<style lang="scss" scoped>
.ranger {
	&__image {
		@apply flex-none flex justify-center items-center;

		&.single {
			@media screen and (min-width: theme("screens.sm")) {
				@apply h-auto w-48;
			}
		}
		@media screen and (min-width: theme("screens.lg")) {
			@apply h-auto w-48;
		}
	}
}
.custom-height {
	@apply max-h-48;
	height: 42.5vw;
}
</style>

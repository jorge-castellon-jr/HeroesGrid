<template>
	<div class="w-full overflow-hidden border card" :class="single ? 'sm:flex' : 'md:flex'">
		<div class="ranger__image" :class="customClasses">
			<img
				class="p-4 rounded-full max-h-48"
				v-if="ranger.imageUrl"
				:src="`${ranger.imageUrl}?h=${single ? '200' : '125'}`"
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
		single: {
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
		customClasses() {
			let classes = []

			if (this.single) classes.push("single")
			if (!this.ranger.imageUrl) classes.push("custom-height")

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

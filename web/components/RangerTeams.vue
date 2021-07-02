<template>
	<div class="flex flex-wrap justify-around max-w-3xl -mx-3 md:mx-auto ranger-teams" id="allTeams">
		<div
			v-for="(team, i) in teams"
			:key="i"
			class="flex w-1/2 px-3 my-3"
			:id="$friendlyURL(team.team)"
		>
			<nuxt-link
				:to="`/${$friendlyURL(team.team)}`"
				class="flex flex-col justify-end p-4 bg-white border border-gray-400 rounded-lg shadow-lg"
			>
				<div class="flex items-center flex-grow mx-auto my-2">
					<img :src="`/uploads/${$friendlyURL(team.team)}.png`" :alt="team.team" class />
				</div>
				<div class="text-center">{{ team.team }}</div>
			</nuxt-link>
		</div>
	</div>
</template>

<script>
export default {
	props: {
		teams: {
			type: Array,
			default: [],
		},
	},
	methods: {},
}
</script>

<style lang="scss" scoped>
.ranger-teams {
	img {
		max-width: 300px;
		@apply w-full;
	}
}
#mighty-morphin {
	order: 1;
}
#zeo {
	order: 2;
}
#turbo {
	order: 3;
}
#lost-galaxy {
	order: 4;
}
#time-force {
	order: 5;
}
#dino-thunder {
	order: 6;
}
#spd {
	order: 7;
}
#super-samurai {
	order: 8;
}
#hyper-force {
	order: 9;
}
p {
	display: inline-grid;
}
</style>

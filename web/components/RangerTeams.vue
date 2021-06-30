<template>
	<div class="flex flex-wrap justify-around max-w-3xl mx-auto ranger-teams" id="allTeams">
		<nuxt-link
			v-for="(team, i) in teams"
			:key="i"
			:to="`/${$friendlyURL(team.team)}`"
			class="flex flex-col justify-end w-2/5 p-4 my-6 bg-white border border-gray-400 rounded-lg shadow-lg"
			:id="$friendlyURL(team.team)"
		>
			<div class="flex items-center flex-grow mx-auto my-2">
				<img :src="`/uploads/${$friendlyURL(team.team)}.png`" :alt="team.team" class />
			</div>
			<div class="text-center">{{ team.team }}</div>
		</nuxt-link>
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

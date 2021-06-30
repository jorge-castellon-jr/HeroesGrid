<template>
	<div class="max-w-3xl mx-auto">
		<h1>Enemies</h1>
		<h2>All Foot Soldiers</h2>
		<ul class="enemies">
			<li
				v-for="(soldier, i) in footSoldiers"
				:key="i"
				:class="`enemies__unit ${
					i % 2 == 0 ? 'enemies__unit--left' : 'enemies__unit--right'
				}`"
			>
				<EnemyCard :enemy="soldier" color="soldier" />
			</li>
		</ul>

		<h2>All Monsters</h2>
		<ul class="enemies">
			<li
				v-for="(monster, i) in monsters"
				:key="i"
				:class="`enemies__unit ${
					i % 2 == 0 ? 'enemies__unit--left' : 'enemies__unit--right'
				}`"
			>
				<EnemyCard :enemy="monster" color="monster" />
			</li>
		</ul>

		<h2>All Bosses</h2>
		<ul class="enemies">
			<li
				v-for="(boss, i) in bosses"
				:key="i"
				:class="`enemies__unit ${
					i % 2 == 0 ? 'enemies__unit--left' : 'enemies__unit--right'
				}`"
			>
				<EnemyCard :enemy="boss" color="boss" />
			</li>
		</ul>
	</div>
</template>

<script>
import { mapGetters } from "vuex"
import EnemyCard from "~/components/EnemyCard"
export default {
	name: "Enemies",
	components: {
		EnemyCard,
	},
	computed: {
		...mapGetters({
			footSoldiers: "getFootSoldiers",
			monsters: "getMonsters",
			bosses: "getBosses",
		}),
	},
}
</script>

<style lang="scss" scoped>
.enemies {
	@apply flex flex-wrap justify-between;
	&__unit {
		@apply w-1/2 pb-6;
		&--left {
			@apply pr-3;
			@media screen and (min-width: theme("screens.md")) {
				@apply pr-0;
			}
		}
		&--right {
			@apply pl-3;
			@media screen and (min-width: theme("screens.md")) {
				@apply pl-0;
			}
		}
		@media screen and (min-width: theme("screens.md")) {
			width: calc(33% - 24px);
		}
	}
}
</style>

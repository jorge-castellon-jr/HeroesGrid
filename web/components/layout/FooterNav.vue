<template>
	<div>
		<a @click="menuOpen = !menuOpen" class="nav__link" :class="menuOpen ? 'open' : ''" id="home-link">
			<PRicon />
			<span class="hidden text-sm capitalize md:block">Menu</span>
		</a>
		<transition name="bottomup">
			<nav v-if="menuOpen" class="nav" :class="menuOpen ? 'open' : 'closed'" @click="menuOpen = false">
				<div class="flex flex-wrap flex-1 md:flex-col md:w-full">
					<nuxt-link v-for="link in nuxtLinks" :key="link.to" :to="link.to" class="nav__link">
						<PRicon :icon="link.icon" />

						<span class="pt-2 text-sm capitalize">{{ link.title }}</span>
					</nuxt-link>
				</div>
				<span class="absolute bottom-0 left-0 px-4 py-6 text-sm text-gray-300">v{{version}}</span>
			</nav>
		</transition>
	</div>
</template>

<script>
import PRicon from "~/components/PRIcons"
export default {
	components: {
		PRicon,
	},
	data() {
		return {
			menuOpen: false,
			menu: [
				{
					title: "Home",
					to: "/",
					icon: "home",
					nuxt: true,
				},
				{
					title: "Rulebooks",
					to: "/rulebooks",
					icon: "rules",
					nuxt: true,
				},
				{
					title: "All Rangers",
					to: "/all-rangers",
					icon: "morpher",
					nuxt: true,
				},
				// {
				// 	title: "All Teams",
				// 	to: "/all-teams",
				// 	icon: "morpher",
				// 	nuxt: true,
				// },
				{
					title: "Randomizer",
					to: "/randomizer",
					icon: "pr-hotg",
					nuxt: true,
				},
				{
					title: "Dice Roller",
					to: "/dice",
					icon: "pr-hotg",
					nuxt: true,
				},
				{
					title: "Token Tracker",
					to: "/tokens",
					icon: "pr-hotg",
					nuxt: true,
				},
				// {
				// 	title: "Countdown",
				// 	to: "/countdown",
				// 	icon: "pr-hotg",
				// 	nuxt: true,
				// },
			],
		}
	},
	computed: {
		nuxtLinks() {
			return this.menu.filter(item => {
				return item.nuxt == true
			})
		},
		aLinks() {
			return this.menu.filter(item => {
				return item.nuxt == false
			})
		},
		version() {
			return process.env.VERSION_NUMBER
		},
	},
}
</script>

<style lang="scss" scoped>
.nav {
	@apply fixed bottom-0 w-full transition-all h-screen pt-4 border-t-0 duration-500 bg-white border-purple-700 z-40;
	box-shadow: 0 16px 0 0 theme("colors.purple.700") inset;

	&__link {
		@apply flex flex-col flex-grow items-center justify-center overflow-hidden whitespace-nowrap text-sm transition-colors duration-100 ease-in-out py-4 w-1/2;
		&:hover {
			@apply bg-gray-100;
		}

		&#home-link {
			@apply fixed border-purple-700 shadow-lg rounded-full bg-white transition-all h-20 w-20 flex items-center justify-center duration-500 z-50;
			left: 50%;
			bottom: 24px;
			transform: translateX(-50%);
			// width: 77px;
			&.open {
				@apply bg-gray-200;
				box-shadow: 0 0 0 8px theme("colors.purple.700");
			}
		}
	}
	@media screen and (min-width: theme("screens.md")) {
		@apply h-full left-0 top-0 rounded-r-lg rounded-l-none flex-col justify-start w-32 border-r-8 border-t-0;
		box-shadow: none;

		&__link {
			@apply flex-grow-0 w-full;
			&#home-link {
				@apply pl-8 items-start border-r-8 border-t-2 border-b-2 rounded-l-none h-auto w-32;
				// left: -40px;
				left: 64px;
				bottom: 24px;
				// width: 170px;
				&.open {
					@apply shadow-lg;
					left: 85px;
					width: 170px;
				}
			}
		}
	}
}

.nuxt-link-exact-active {
	@apply bg-gray-200 text-purple-600;
}
</style>

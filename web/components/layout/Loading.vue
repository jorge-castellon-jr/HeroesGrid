<template>
	<div
		class="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen overflow-hidden bg-white loading"
	>
		<div class="spinner"></div>
		<PRicon class="absolute" width="175" height="175" />
	</div>
</template>

<script>
import PRicon from "~/components/PRIcons"
export default {
	components: {
		PRicon,
	},
}
</script>

<style lang="scss" scoped>
.loading {
	box-shadow: 0 -16px 0 0 theme("colors.purple.700") inset;
}
.spinner {
	width: 300px;
	height: 300px;
	background-color: theme("colors.purple.700");

	border-radius: 100%;
	animation: sk-scaleout 2s infinite cubic-bezier(0.29, 1.2, 1, -0.68);
}

@-webkit-keyframes sk-scaleout {
	0% {
		-webkit-transform: scale(0);
	}
	100% {
		-webkit-transform: scale(1);
		opacity: 0;
	}
}

@keyframes sk-scaleout {
	0% {
		-webkit-transform: scale(0);
		transform: scale(0);
	}
	100% {
		-webkit-transform: scale(1);
		transform: scale(1);
		opacity: 0;
	}
}
</style>
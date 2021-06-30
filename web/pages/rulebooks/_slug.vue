<template>
	<div>
		<nuxt-content :document="rulebook" />
	</div>
</template>

<script>
export default {
	async asyncData() {
		return {}
	},
	props: {
		rulebook: {
			type: Object,
		},
	},
}
</script>

<style lang="scss" scoped>
.highlight {
	@apply bg-orange-300 inline-block p-2;
}
.blue {
	@apply text-blue-500;
}
blockquote {
	@apply border border-black p-4 m-4;
	strong {
		@apply text-red-600;
	}
}

.card {
}

.float {
	&.right {
		float: right;
	}
}
h1,
h2,
h3 {
	clear: both;
}

.task-list-item {
	@apply pl-6;
	input {
		display: none;
	}
}
thead {
	tr {
		display: flex;
		th {
			@apply w-full text-left;
		}
	}
}
tbody {
	tr {
		display: flex;
		td {
			@apply w-full p-4;
		}
	}
}
</style>

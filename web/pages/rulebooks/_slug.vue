<template>
	<div class="max-w-3xl px-4 mx-auto">
		<nuxt-content v-if="rulebook" :document="rulebook" />
	</div>
</template>

<script>
export default {
	async asyncData() {
		return {}
	},
	data() {
		return {
			rulebook: null,
		}
	},
	async mounted() {
		const rulebooks = await this.$content("rulebooks").fetch()
		let slug = this.$route.params.slug
		let rulebook = rulebooks.find(r => {
			return r.slug == slug
		})

		console.log(rulebook)
		this.rulebook = rulebook
		this.$store.commit("setLoadingState", false)
	},
	// props: {
	// 	rulebook: {
	// 		type: Object,
	// 	},
	// },
}
</script>

<style lang="scss">
.highlight {
	@apply bg-yellow-200 inline-block p-2;
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

<template>
	<div class="max-w-3xl px-3 mx-auto">
		<div v-html="compiledMD"></div>
	</div>
</template>

<script>
import marked from "marked"
export default {
	data() {
		return {
			rulebook: { content: "" },
		}
	},
	async mounted() {
		let slug = this.$route.params.slug
		let rulebook = await this.$sanityClient.fetch(
			this.$getQuery("getRulebookSingle", slug),
		)

		this.rulebook = rulebook
		setTimeout(() => this.$store.commit("setLoadingState", false), 500)
	},
	computed: {
		compiledMD() {
			return marked(this.rulebook.content)
		},
	},
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
h2 {
	@apply mb-3 mt-6;
}
ol {
	@apply pb-2;
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
		@apply flex items-end;
		td {
			@apply w-full p-2 text-center;
		}
	}
}
</style>

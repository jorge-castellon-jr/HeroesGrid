<template>
	<div class="my-4 card content">
		<h3>{{card.name}}{{card.quantity > 1 ? ` x ${card.quantity}` : ''}}</h3>
		<p>Cost: {{card.cost == -1 ? 'X' : card.cost}}</p>
		<p>
			<strong>{{cardType}}</strong>
		</p>
		<p>{{card.desc}}</p>
		<p>Shields: {{card.shields}}</p>
	</div>
</template>

<script>
export default {
	props: {
		card: {
			type: Object,
			default: () => {},
		},
	},
	computed: {
		cardType() {
			if (this.card.type == "attack") {
				if (this.card.cost == -1) return "Attack: Special"
				if (this.card.damage.static)
					return `Attack: ${this.card.damage.static} Damage`
				return `Attack: ${this.card.damage.dice} Dice`
			}
			return this.$dashToSpace(this.card.type)
		},
	},
}
</script>

<style lang="scss" scoped>
</style>
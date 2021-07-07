<template>
	<div class="my-4 card content">
		<h3>{{card.name}}{{card.quantity > 1 ? ` x ${card.quantity}` : ''}}</h3>
		<p v-if="card.cost">Cost: {{card.cost.x ? 'X' : card.cost.amount}}</p>
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
				if (this.card.damage.special) return "Attack: Special"
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
<template>
	<div class="my-4 card content">
		<h3>{{card.name}}{{card.cardInfo.quantity > 1 ? ` x ${card.cardInfo.quantity}` : ''}}</h3>
		<p>Cost: {{card.cardInfo.x ? 'X' : card.cardInfo.amount}}</p>
		<p>
			<strong>{{cardType}}</strong>
		</p>
		<p>{{card.effects.effect}}</p>
		<p>Shields: {{card.cardInfo.shields}}</p>
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
			if (this.card.effects.type == "attack") {
				let text = "Attack:"
				if (this.card.cardInfo.special) return `${text} Special`

				if (this.card.cardInfo.dice) text += ` ${this.card.cardInfo.dice} Dice`
				if (this.card.cardInfo.static)
					text += ` ${this.card.cardInfo.static} Damage`

				return text
			}
			return this.$dashToSpace(this.card.effects.type)
		},
	},
}
</script>

<style lang="scss" scoped>
</style>
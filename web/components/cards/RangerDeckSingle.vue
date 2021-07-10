<template>
	<div class="my-4 card content">
		<h3>{{card.name}}{{card.cardInfo.quantity > 1 ? ` x ${card.cardInfo.quantity}` : ''}}</h3>
		<p>Cost: {{card.cardInfo.x ? 'X' : card.cardInfo.amount}}</p>
		<p>
			<strong>
				<div v-if="card.effects.type == 'attack'" class="flex">
					<span class="mr-2">Attack:</span>

					<span v-if="card.cardInfo.special">X</span>
					<div v-else v-for="a in card.cardInfo.dice" :key="`dice-${a}`">
						<PRIcons icon="dice" class="inline-block" :height="18" :width="18" />
					</div>
					<div v-if="card.cardInfo.static">
						<span v-if="card.cardInfo.dice" class="ml-2">+</span>
						{{card.cardInfo.static}}
						<PRIcons icon="damage" class="inline-block" :height="18" :width="18" />
					</div>
				</div>
				<span v-else>{{$dashToSpace(card.effects.type)}}</span>
			</strong>
		</p>
		<p v-if="card.effects.effect" v-html="$changeIcon(card.effects.effect)"></p>
		<p v-if="card.effects.extraEffect">
			<PRIcons :icon="card.effects.extraType" class="inline-block" :height="18" :width="18" />
			<span v-html="`: ${$changeIcon(card.effects.extraEffect)}`"></span>
		</p>
		<p class="text-right">
			<PRIcons
				v-for="s in card.cardInfo.shields"
				:key="`shield-${s}`"
				icon="shield"
				class="inline-block"
				:height="18"
				:width="18"
			/>
		</p>
	</div>
</template>

<script>
import PRIcons from "@/components/PRIcons.vue"
export default {
	components: {
		PRIcons,
	},
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
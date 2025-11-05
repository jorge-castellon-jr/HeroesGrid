import { dashToSpace } from '../../utils/helpers';

export default function RangerDeckSingle({ card }) {
	const getCardType = () => {
		if (card?.effects?.type === 'attack') {
			let text = 'Attack:';
			if (card.cardInfo?.special) return `${text} Special`;

			if (card.cardInfo?.dice) text += ` ${card.cardInfo.dice} Dice`;
			if (card.cardInfo?.static) text += ` ${card.cardInfo.static} Damage`;

			return text;
		}
		return dashToSpace(card?.effects?.type || '');
	};

	const displayQuantity = card?.cardInfo?.quantity > 1 
		? ` x ${card.cardInfo.quantity}` 
		: '';

	return (
		<div className="my-4 card content">
			<h3>
				{card?.name}{displayQuantity}
			</h3>
			<p>Cost: {card?.cardInfo?.x ? 'X' : card?.cardInfo?.amount}</p>
			<p>
				<strong>{getCardType()}</strong>
			</p>
			<p>{card?.effects?.effect}</p>
			<p>Shields: {card?.cardInfo?.shields}</p>
		</div>
	);
}

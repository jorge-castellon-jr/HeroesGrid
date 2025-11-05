import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import RangerDeckSingle from '../components/cards/RangerDeckSingle';
import sanity from '../lib/sanityClient';

export default function Ranger() {
	const { ranger: rangerParam } = useParams();
	const { setLoadingState } = useApp();
	const [ranger, setRanger] = useState(null);

	useEffect(() => {
		const fetchData = async () => {
			const query = `*[_type == 'ranger' && rangerInfo.slug.current == '${rangerParam}'] {
				_id,
				name,
				rangerInfo {
					...,
					'color': color.title,
					'slug': slug.current,
					'team': team->name,
					'teamPosition': teamPosition.current
				},
				rangerCards {
					...,
					'image': image.asset->url,
					zords[]->
				},
				'deck': Deck[]
			}[0]`;

			const data = await sanity.fetch(query);

			setRanger(data);

			setTimeout(() => setLoadingState(false), 500);
		};

		fetchData();
	}, [rangerParam, setLoadingState]);

	if (!ranger) {
		return null;
	}

	return (
		<div className="max-w-3xl mx-auto mt-6 ranger">
			<RangerCard className="mb-10" ranger={ranger} single />

			{ranger.rangerCards?.deck?.length > 0 && (
				<div className="mb-10">
					<h2>Deck</h2>
					{ranger.rangerCards.deck.map((card) => (
						<RangerDeckSingle key={card._key} card={card} />
					))}
				</div>
			)}

			{ranger.rangerCards?.zords?.length > 0 && (
				<div className="mb-10">
					<h2>Zords</h2>
					{ranger.rangerCards.zords.map((zord) => (
						<div key={zord._key || zord._id}>
							<h3>{zord.name}</h3>
							<p>{zord.ability}</p>
						</div>
					))}
				</div>
			)}
		</div>
	);
}

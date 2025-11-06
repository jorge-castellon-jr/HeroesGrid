import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import RangerDeckSingle from '../components/cards/RangerDeckSingle';
import { database } from '../database';
import { initializeDatabase } from '../database/seed';
import { Q } from '@nozbe/watermelondb';

export default function Ranger() {
	const { ranger: rangerParam } = useParams();
	const { setLoadingState } = useApp();
	const [ranger, setRanger] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Wait for database initialization
				await initializeDatabase();
				
				const rangersCollection = database.get('rangers');
				
				// Query ranger by slug
				const rangers = await rangersCollection
					.query(
						Q.where('slug', rangerParam),
						Q.where('published', true)
					)
					.fetch();
				
				if (rangers.length === 0) {
					console.error('Ranger not found');
					setLoadingState(false);
					return;
				}
				
				const r = rangers[0];
				console.log('Raw Ranger Record:', r);
				console.log('Ranger _raw:', r._raw);
				console.log('Ranger published:', r.published);
				
				const team = await r.team.fetch();
				console.log('Team:', team);
				
				// Fetch full card details for deck
				const rangerCardsCollection = database.get('ranger_cards');
				const deckWithDetails = [];
				
				if (r.deck && Array.isArray(r.deck)) {
					for (const deckCard of r.deck) {
						try {
							console.log('Looking for card:', deckCard.card_name);
							// Find the full card by ID
							const fullCards = await rangerCardsCollection
								.query(Q.where('name', deckCard.card_name))
								.fetch();
							
							console.log('Found cards:', fullCards.length, fullCards);
							if (fullCards.length > 0) {
								const fullCard = fullCards[0];
								console.log('Card published status:', fullCard.published);
								console.log('Full card:', fullCard._raw);
								deckWithDetails.push({
									card_id: deckCard.card_id,
									order: deckCard.order,
									name: deckCard.override_name || deckCard.card_name,
									cardInfo: {
										quantity: deckCard.count,
										amount: fullCard.energyCost,
										x: fullCard.energyCost?.toLowerCase() === 'x',
										dice: fullCard.attackDice,
										static: fullCard.attackHit,
										shields: fullCard.shields,
										special: fullCard.type?.toLowerCase() === 'special'
									},
									effects: {
										type: fullCard.type?.toLowerCase() || 'maneuver',
										effect: fullCard.description
									}
								});
							} else {
								console.warn('No card found for:', deckCard.card_name);
							}
						} catch (error) {
							console.error('Error fetching card:', deckCard.card_name, error);
						}
					}
				}
				
				console.log('Deck with details:', deckWithDetails);
				
				// Transform to match component structure
				const transformedRanger = {
					name: r.name,
					rangerInfo: {
						slug: r.slug,
						team: team?.name || '',
						color: r.color,
						teamPosition: r.teamPosition,
						cardTitle: r.cardTitle,
						title: r.title
					},
					rangerCards: {
						image: r.imageUrl,
						abilityName: r.abilityName,
						abilityDesc: r.ability,
						deck: deckWithDetails,
						zords: [] // TODO: implement zords relationship if needed
					},
					deck: deckWithDetails
				};
				
				setRanger(transformedRanger);
				setTimeout(() => setLoadingState(false), 500);
			} catch (error) {
				console.error('Error fetching ranger:', error);
				setLoadingState(false);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [rangerParam]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg">Loading ranger...</p>
			</div>
		);
	}

	if (!ranger) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg">Ranger not found</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto mt-6 ranger">
			<RangerCard className="mb-10" ranger={ranger} single />

			{ranger.rangerCards?.deck?.length > 0 && (
				<div className="mb-10">
					<h2>Deck</h2>
					{ranger.rangerCards.deck.map((card, index) => (
						<RangerDeckSingle key={`${card.card_id}-${card.order || index}`} card={card} />
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

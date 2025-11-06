import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';

const StackedCard = ({ card }) => {
  const wrapperRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const updateScale = () => {
      const wrapperWidth = wrapperRef.current.offsetWidth;
      const baseWidth = 150;
      const newScale = wrapperWidth / baseWidth;
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="relative" ref={wrapperRef}>
      <RangerCard card={card} />
      {card.quantity > 1 && (
        <div className="absolute" style={{ left: '-3%', top: '3%', right: '0', zIndex: -1, pointerEvents: 'none' }}>
          <RangerCard card={card} noWrapper parentScale={scale} />
        </div>
      )}
    </div>
  );
};
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

                // Transform to RangerCard format
                const cardType = fullCard.type?.toLowerCase() || 'maneuver';
                const isAttack = cardType.includes('attack');

                const transformedCard = {
                  name: (deckCard.override_name || deckCard.card_name || '').toUpperCase(),
                  shields: fullCard.shields || '0',
                  text: fullCard.description ? [fullCard.description] : [''],
                  team: team?.name || '',
                  color: r.color || 'red',
                  energy: fullCard.energyCost?.toString().toLowerCase() === 'x' ? -1 : parseInt(fullCard.energyCost) || 0,
                  type: cardType.split(':')[0].trim(),
                  quantity: deckCard.count,
                  order: deckCard.order
                };

                // Add attack info if it's an attack card
                if (isAttack) {
                  transformedCard.attack = [];

                  // Fixed damage
                  if (fullCard.attackHit && fullCard.attackHit > 0) {
                    transformedCard.attack.push({
                      value: fullCard.attackHit,
                      fixed: true
                    });
                  }

                  // Dice
                  if (fullCard.attackDice && fullCard.attackDice > 0) {
                    transformedCard.attack.push({
                      value: fullCard.attackDice,
                      fixed: false
                    });
                  }

                  // If no attack data, mark as special
                  if (transformedCard.attack.length === 0) {
                    transformedCard.attack.push({
                      value: -1,
                      fixed: false
                    });
                  }
                }

                console.log('Transformed card:', transformedCard);
                deckWithDetails.push(transformedCard);
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
          <h2 className="text-2xl font-bold mb-4">Deck</h2>
          <div className="grid grid-cols-2 gap-8">
            {ranger.rangerCards.deck.map((card, index) => (
              <StackedCard key={`${card.order || index}`} card={card} />
            ))}
          </div>
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

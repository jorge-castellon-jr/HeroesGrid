import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import RangerEditModal from '../components/RangerEditModal';
import { isAdminMode } from '../utils/adminMode';

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
  const navigate = useNavigate();
  const [ranger, setRanger] = useState(null);
  const [rangerRecord, setRangerRecord] = useState(null); // Store the DB record
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const adminEnabled = isAdminMode();

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
        
        // Store the DB record for editing
        setRangerRecord(r);

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

  const handleSave = async () => {
    // Reload the ranger data after save
    setIsLoading(true);
    await fetchRangerData();
    setIsLoading(false);
  };

  const fetchRangerData = async () => {
    try {
      await initializeDatabase();

      const rangersCollection = database.get('rangers');
      const rangers = await rangersCollection
        .query(
          Q.where('slug', rangerParam),
          Q.where('published', true)
        )
        .fetch();

      if (rangers.length === 0) return;

      const r = rangers[0];
      setRangerRecord(r);

      const team = await r.team.fetch();
      const rangerCardsCollection = database.get('ranger_cards');
      const deckWithDetails = [];

      if (r.deck && Array.isArray(r.deck)) {
        for (const deckCard of r.deck) {
          try {
            const fullCards = await rangerCardsCollection
              .query(Q.where('name', deckCard.card_name))
              .fetch();

            if (fullCards.length > 0) {
              const fullCard = fullCards[0];
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

              if (isAttack) {
                transformedCard.attack = [];
                if (fullCard.attackHit && fullCard.attackHit > 0) {
                  transformedCard.attack.push({ value: fullCard.attackHit, fixed: true });
                }
                if (fullCard.attackDice && fullCard.attackDice > 0) {
                  transformedCard.attack.push({ value: fullCard.attackDice, fixed: false });
                }
                if (transformedCard.attack.length === 0) {
                  transformedCard.attack.push({ value: -1, fixed: false });
                }
              }

              deckWithDetails.push(transformedCard);
            }
          } catch (error) {
            console.error('Error fetching card:', deckCard.card_name, error);
          }
        }
      }

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
          zords: []
        },
        deck: deckWithDetails
      };

      setRanger(transformedRanger);
    } catch (error) {
      console.error('Error fetching ranger:', error);
    }
  };

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
    <div className="max-w-3xl mx-auto mt-6 ranger relative">
      {/* Edit Button - Only visible in admin mode */}
      {adminEnabled && rangerRecord && (
        <button
          onClick={() => setShowEditModal(true)}
          className="fixed bottom-24 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-40"
          title="Edit Ranger"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      )}

      {/* Edit Modal */}
      {showEditModal && rangerRecord && (
        <RangerEditModal
          ranger={rangerRecord}
          onClose={() => setShowEditModal(false)}
          onSave={handleSave}
        />
      )}

      <RangerCard className="mb-10" ranger={ranger} single />

      {ranger.rangerCards?.deck?.length > 0 && (
        <div className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Deck</h2>
            <button
              onClick={() => navigate(`/print-to-play?rangers=${rangerParam}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Deck
            </button>
          </div>
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

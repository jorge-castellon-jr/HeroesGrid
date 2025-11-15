import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { database } from '../database';
import { initializeDatabase } from '../database/seed';
import { Q } from '@nozbe/watermelondb';
import PrintRangerCard from '../components/cards/PrintRangerCard';
import '../components/cards/RangerCard.css';
import './PrintToPlay.css';
import { Printer } from 'lucide-react';

// Ranger colors constant (moved outside to prevent recreation)
const RANGER_COLORS = {
  red: '#E53E3E',
  blue: '#0080FF',
  green: '#38A169',
  yellow: '#FFC000',
  pink: '#D53F8C',
  black: '#2D3748',
  white: '#F7FAFC',
  orange: '#FF8C00',
  purple: '#6B21A8',
  gold: '#B8860B',
  silver: '#A0AEC0',
  shadow: '#4A9AB0',
  dark: '#392C77',
};

// Card component - simplified without memo
const CardCell = ({ card, pageIdx, cardIdx }) => {
  const bleedColor = RANGER_COLORS[card.color?.toLowerCase()] || '#E53E3E';
  
  return (
    <div className="card-cell">
      <div className="card-wrapper-with-bleed" style={{ backgroundColor: bleedColor }}>
        <div className="card-wrapper">
          <PrintRangerCard card={card} />
        </div>
      </div>
    </div>
  );
};

// Page component - simplified without memo
const PrintPage = ({ pageCards, pageIdx }) => (
  <div className="print-page show-bleed">
    {/* Corner bleed marks */}
    <div className="bleed-mark bleed-mark-tl"></div>
    <div className="bleed-mark bleed-mark-tr"></div>
    <div className="bleed-mark bleed-mark-bl"></div>
    <div className="bleed-mark bleed-mark-br"></div>
    
    {/* Row divider marks */}
    <div className="cut-mark cut-mark-row-1-left"></div>
    <div className="cut-mark cut-mark-row-1-right"></div>
    <div className="cut-mark cut-mark-row-2-left"></div>
    <div className="cut-mark cut-mark-row-2-right"></div>
    
    {/* Column divider marks */}
    <div className="cut-mark cut-mark-col-1-top"></div>
    <div className="cut-mark cut-mark-col-1-bottom"></div>
    <div className="cut-mark cut-mark-col-2-top"></div>
    <div className="cut-mark cut-mark-col-2-bottom"></div>
    
    <div className="cards-grid">
      {pageCards.map((card, cardIdx) => (
        <CardCell key={`${pageIdx}-${cardIdx}`} card={card} pageIdx={pageIdx} cardIdx={cardIdx} />
      ))}
      
      {/* Fill empty spaces */}
      {[...Array(9 - pageCards.length)].map((_, idx) => (
        <div key={`empty-${pageIdx}-${idx}`} className="card-cell card-cell-empty"></div>
      ))}
    </div>
  </div>
);

export default function PrintToPlay() {
  const [searchParams] = useSearchParams();
  const [rangers, setRangers] = useState([]);
  const [allCards, setAllCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Memoize rangerSlugs to prevent infinite loop
  const rangerSlugsParam = searchParams.get('rangers');
  const rangerSlugs = useMemo(
    () => rangerSlugsParam?.split(',') || [],
    [rangerSlugsParam]
  );

  useEffect(() => {
    const fetchRangers = async () => {
      try {
        await initializeDatabase();
        const rangersCollection = database.get('rangers');
        const customRangersCollection = database.get('custom_rangers');
        const rangerCardsCollection = database.get('ranger_cards');
        const fetchedRangers = [];
        const cards = [];

        for (const slug of rangerSlugs) {
          // Try official rangers first
          let rangers = await rangersCollection
            .query(
              Q.where('slug', slug),
              Q.where('published', true)
            )
            .fetch();
          
          let isCustom = false;
          // If not found, try custom rangers
          if (rangers.length === 0) {
            rangers = await customRangersCollection
              .query(Q.where('slug', slug))
              .fetch();
            isCustom = true;
          }

          if (rangers.length > 0) {
            const r = rangers[0];
            let team = null;
            let deckData = [];
            
            if (isCustom) {
              // Custom ranger - deck is stored as JSON
              team = r.customTeamName ? { name: r.customTeamName } : (r.teamId ? await r.team.fetch() : null);
              deckData = JSON.parse(r.deck || '[]');
              
              // Process custom ranger deck
              for (const card of deckData) {
                const transformedCard = {
                  name: card.name.toUpperCase(),
                  shields: card.shields || '0',
                  text: card.description ? [card.description] : [''],
                  team: team?.name || '',
                  color: r.color || 'red',
                  cardTitle: r.cardTitle || `${team?.name || ''} ${r.color || ''}`,
                  energy: card.energyCost?.toString().toLowerCase() === 'x' ? -1 : parseInt(card.energyCost) || 0,
                  type: card.type === 'custom' ? card.customType : card.type,
                  quantity: card.count || 1,
                };

                // Add attack info if it's an attack card
                if (card.type === 'attack') {
                  transformedCard.attack = [];
                  if (card.attackHit && parseInt(card.attackHit) > 0) {
                    transformedCard.attack.push({
                      value: parseInt(card.attackHit),
                      fixed: true
                    });
                  }
                  if (card.attackDice && parseInt(card.attackDice) > 0) {
                    transformedCard.attack.push({
                      value: parseInt(card.attackDice),
                      fixed: false
                    });
                  }
                  if (transformedCard.attack.length === 0) {
                    transformedCard.attack.push({
                      value: -1,
                      fixed: false
                    });
                  }
                }

                // Add multiple copies based on count
                for (let i = 0; i < (card.count || 1); i++) {
                  cards.push(transformedCard);
                }
              }
            } else {
              // Official ranger
              team = await r.team.fetch();
              deckData = r.deck && Array.isArray(r.deck) ? r.deck : [];
              
              // Fetch full card details for official deck
              for (const deckCard of deckData) {
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
                    cardTitle: r.cardTitle || `${team?.name || ''} ${r.color || ''}`,
                    energy: fullCard.energyCost?.toString().toLowerCase() === 'x' ? -1 : parseInt(fullCard.energyCost) || 0,
                    type: cardType.split(':')[0].trim(),
                    quantity: deckCard.count,
                    order: deckCard.order
                  };

                  // Add attack info if it's an attack card
                  if (isAttack) {
                    transformedCard.attack = [];

                    if (fullCard.attackHit && fullCard.attackHit > 0) {
                      transformedCard.attack.push({
                        value: fullCard.attackHit,
                        fixed: true
                      });
                    }

                    if (fullCard.attackDice && fullCard.attackDice > 0) {
                      transformedCard.attack.push({
                        value: fullCard.attackDice,
                        fixed: false
                      });
                    }

                    if (transformedCard.attack.length === 0) {
                      transformedCard.attack.push({
                        value: -1,
                        fixed: false
                      });
                    }
                  }

                  // Add multiple copies based on quantity
                  for (let i = 0; i < deckCard.count; i++) {
                    cards.push(transformedCard);
                  }
                }
              }
            }

            fetchedRangers.push({
              name: r.name,
              color: r.color,
              team: team?.name || ''
            });
          }
        }

        setRangers(fetchedRangers);
        setAllCards(cards);
      } catch (error) {
        console.error('Error fetching rangers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (rangerSlugs.length > 0) {
      fetchRangers();
    } else {
      setIsLoading(false);
    }
  }, [rangerSlugs]);

  const handlePrint = () => {
    window.print();
  };

  // Split cards into pages of 9 - memoized to prevent recalculation
  const pages = useMemo(() => {
    const result = [];
    for (let i = 0; i < allCards.length; i += 9) {
      result.push(allCards.slice(i, i + 9));
    }
    return result;
  }, [allCards]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading cards...</div>
      </div>
    );
  }

  if (rangers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-bold">No Rangers Selected</h1>
        <p className="text-gray-600">Add ranger slugs to the URL: ?rangers=slug1,slug2</p>
      </div>
    );
  }

  return (
    <div className="print-to-play-container bg-gray-100 dark:bg-[#0f172a]">
      {/* Controls - hidden when printing */}
      <div className="print-controls no-print bg-white dark:bg-[#1e293b] border-b border-gray-200 dark:border-[#334155]">
        <div className="controls-header">
          <h1 className="text-2xl font-bold dark:text-white">Print to Play</h1>
          <button onClick={handlePrint} className="print-button">
            <Printer size={20} />
            Print Cards
          </button>
        </div>
        
        <div className="rangers-info bg-gray-50 dark:bg-[#1f2937]">
          <h2 className="text-lg font-semibold mb-2 dark:text-white">Rangers to Print:</h2>
          <div className="flex flex-wrap gap-2">
            {rangers.map((ranger, idx) => (
              <span key={idx} className="ranger-badge">
                {ranger.team} {ranger.color}
              </span>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
            Total cards: {allCards.length} ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
          </p>
        </div>
      </div>

      {/* Print Pages */}
      <div className="print-pages">
        {pages.map((pageCards, pageIdx) => (
          <PrintPage 
            key={pageIdx} 
            pageCards={pageCards} 
            pageIdx={pageIdx}
          />
        ))}
      </div>
    </div>
  );
}

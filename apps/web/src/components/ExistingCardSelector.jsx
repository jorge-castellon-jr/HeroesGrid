import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search } from 'lucide-react';
import { database } from '../database';

const ExistingCardSelector = ({ 
	isOpen, 
	onClose, 
	onSelect,
	mode = 'add' // 'add' or 'replace'
}) => {
	const [cards, setCards] = useState([]);
	const [filteredCards, setFilteredCards] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [typeFilter, setTypeFilter] = useState('all');
	const [selectedCards, setSelectedCards] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	const cardTypes = [
		{ value: 'all', label: 'All Types' },
		{ value: 'attack', label: 'Attack' },
		{ value: 'maneuver', label: 'Maneuver' },
		{ value: 'reaction', label: 'Reaction' }
	];

	useEffect(() => {
		if (isOpen && cards.length === 0) {
			loadCards();
		}
	}, [isOpen]);

	useEffect(() => {
		filterCards();
	}, [searchQuery, typeFilter, cards]);

	const loadCards = async () => {
		setIsLoading(true);
		try {
			const rangerCardsCollection = database.get('ranger_cards');
			const fetchedCards = await rangerCardsCollection.query().fetch();
			// Convert to plain objects
			const cardsData = fetchedCards.map(card => ({
				id: card.id,
				name: card.name,
				energyCost: card.energyCost,
				type: card.type,
				description: card.description,
				shields: card.shields,
				attackDice: card.attackDice,
				attackHit: card.attackHit
			}));
			setCards(cardsData);
			setFilteredCards(cardsData);
		} catch (error) {
			console.error('Error loading cards:', error);
			alert('Failed to load cards from database');
		} finally {
			setIsLoading(false);
		}
	};

	const filterCards = () => {
		let filtered = cards;

		// Filter by type
		if (typeFilter !== 'all') {
			filtered = filtered.filter(card => {
				const cardType = card.type.toLowerCase();
				return cardType.includes(typeFilter);
			});
		}

		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			filtered = filtered.filter(card => 
				card.name.toLowerCase().includes(query) ||
				card.description?.toLowerCase().includes(query)
			);
		}

		setFilteredCards(filtered);
	};

	const handleToggleCard = (card) => {
		setSelectedCards(prev => {
			const isSelected = prev.some(c => c.id === card.id);
			if (isSelected) {
				return prev.filter(c => c.id !== card.id);
			} else {
				return [...prev, card];
			}
		});
	};

	const isCardSelected = (cardId) => {
		return selectedCards.some(c => c.id === cardId);
	};

	const handleSelectCards = () => {
		if (selectedCards.length === 0) {
			alert('Please select at least one card');
			return;
		}

		// Convert cards to deck format
		const deckCards = selectedCards.map(card => ({
			name: card.name,
			energyCost: card.energyCost,
			type: card.type.toLowerCase().replace(/^attack:\s*/i, ''),
			description: card.description,
			shields: card.shields,
			attackDice: card.attackDice,
			attackHit: card.attackHit,
			count: 1
		}));

		onSelect(deckCards);
		handleClose();
	};

	const handleClose = () => {
		setSearchQuery('');
		setTypeFilter('all');
		setSelectedCards([]);
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{mode === 'replace' ? 'Replace with Official Card' : 'Add Official Cards'}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 flex-1 overflow-hidden flex flex-col">
					{/* Filters */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="card-search">Search Cards</Label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									id="card-search"
									type="text"
									placeholder="Search by name or description..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className="pl-10"
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="type-filter">Filter by Type</Label>
							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger id="type-filter">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{cardTypes.map(type => (
										<SelectItem key={type.value} value={type.value}>
											{type.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					{/* Selected Count */}
					{selectedCards.length > 0 && (
						<div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded">
							{selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
						</div>
					)}

					{/* Cards List */}
					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<div className="text-center py-8 text-muted-foreground">
								Loading cards...
							</div>
						) : filteredCards.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								{searchQuery || typeFilter !== 'all' ? 'No cards found matching your filters' : 'No cards available'}
							</div>
						) : (
							<div className="grid gap-2">
								{filteredCards.map((card) => (
									<Card 
										key={card.id} 
										className={`cursor-pointer hover:border-primary transition-colors ${isCardSelected(card.id) ? 'border-primary bg-primary/5' : ''}`}
										onClick={() => handleToggleCard(card)}
									>
										<CardContent className="pt-4">
											<div className="flex items-start gap-3">
												<Checkbox 
													checked={isCardSelected(card.id)}
													onCheckedChange={() => handleToggleCard(card)}
													onClick={(e) => e.stopPropagation()}
												/>
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<h4 className="font-semibold truncate">{card.name}</h4>
														<span className="text-xs px-2 py-0.5 bg-muted rounded">
															{card.type}
														</span>
													</div>
													<div className="flex gap-3 text-sm text-muted-foreground mb-2">
														<span>Energy: {card.energyCost}</span>
														<span>Shields: {card.shields}</span>
														{(card.attackDice > 0 || card.attackHit > 0) && (
															<span>
																Attack: {card.attackHit > 0 && `${card.attackHit} + `}{card.attackDice > 0 && `${card.attackDice}d`}
															</span>
														)}
													</div>
													{card.description && (
														<p className="text-sm text-muted-foreground line-clamp-2">
															{card.description}
														</p>
													)}
												</div>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>

					{/* Footer */}
					<div className="border-t pt-3 text-sm text-muted-foreground">
						Showing {filteredCards.length} of {cards.length} cards
					</div>
				</div>

				<DialogFooter>
					<Button 
						onClick={handleSelectCards} 
						className="flex-1"
						disabled={selectedCards.length === 0}
					>
						{mode === 'replace' 
							? `Replace with ${selectedCards.length} card${selectedCards.length !== 1 ? 's' : ''}`
							: `Add ${selectedCards.length} card${selectedCards.length !== 1 ? 's' : ''}`
						}
					</Button>
					<Button onClick={handleClose} variant="secondary" className="flex-1">
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ExistingCardSelector;

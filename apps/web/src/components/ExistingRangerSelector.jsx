import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search } from 'lucide-react';

const ExistingRangerSelector = ({ 
	isOpen, 
	onClose, 
	onSelect,
	mode = 'add' // 'add' or 'replace'
}) => {
	const [rangers, setRangers] = useState([]);
	const [filteredRangers, setFilteredRangers] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isOpen && rangers.length === 0) {
			loadRangers();
		}
	}, [isOpen]);

	useEffect(() => {
		filterRangers();
	}, [searchQuery, rangers]);

	const loadRangers = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/data/export/rangers.json');
			const data = await response.json();
			// Filter out rangers with missing ability names
			const validRangers = data.filter(r => r.ability_name && r.ability_name !== '???');
			setRangers(validRangers);
			setFilteredRangers(validRangers);
		} catch (error) {
			console.error('Error loading rangers:', error);
			alert('Failed to load rangers data');
		} finally {
			setIsLoading(false);
		}
	};

	const filterRangers = () => {
		if (!searchQuery.trim()) {
			setFilteredRangers(rangers);
			return;
		}

		const query = searchQuery.toLowerCase();
		const filtered = rangers.filter(ranger => 
			ranger.name.toLowerCase().includes(query) ||
			ranger.title?.toLowerCase().includes(query) ||
			ranger.color.toLowerCase().includes(query) ||
			ranger.ability_name.toLowerCase().includes(query)
		);
		setFilteredRangers(filtered);
	};

	const handleSelect = (ranger) => {
		const characterData = {
			name: ranger.name,
			title: ranger.title || '',
			abilityName: ranger.ability_name,
			ability: ranger.ability
		};
		onSelect(characterData);
		handleClose();
	};

	const handleClose = () => {
		setSearchQuery('');
		onClose();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
				<DialogHeader>
					<DialogTitle>
						{mode === 'replace' ? 'Replace with Official Ranger' : 'Select Official Ranger'}
					</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 flex-1 overflow-hidden flex flex-col">
					{/* Search */}
					<div className="space-y-2">
						<Label htmlFor="ranger-search">Search Rangers</Label>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
							<Input
								id="ranger-search"
								type="text"
								placeholder="Search by name, title, color, or ability..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10"
							/>
						</div>
					</div>

					{/* Rangers List */}
					<div className="flex-1 overflow-y-auto">
						{isLoading ? (
							<div className="text-center py-8 text-muted-foreground">
								Loading rangers...
							</div>
						) : filteredRangers.length === 0 ? (
							<div className="text-center py-8 text-muted-foreground">
								{searchQuery ? 'No rangers found matching your search' : 'No rangers available'}
							</div>
						) : (
							<div className="grid gap-3">
								{filteredRangers.map((ranger) => (
									<Card key={`${ranger.id}-${ranger.slug}`} className="hover:border-primary transition-colors">
										<CardContent className="pt-4">
											<div className="flex justify-between items-start gap-4">
												<div className="flex-1 min-w-0">
													<div className="flex items-center gap-2 mb-1">
														<h4 className="font-semibold truncate">{ranger.name}</h4>
														<span className={`px-2 py-0.5 text-xs rounded-full bg-${ranger.color}-100 text-${ranger.color}-800 dark:bg-${ranger.color}-900 dark:text-${ranger.color}-200`}>
															{ranger.color}
														</span>
													</div>
													{ranger.title && (
														<p className="text-sm text-muted-foreground mb-2">{ranger.title}</p>
													)}
													<div className="bg-muted p-2 rounded text-sm">
														<p className="font-medium mb-1">{ranger.ability_name}</p>
														<p className="text-muted-foreground line-clamp-2">{ranger.ability}</p>
													</div>
												</div>
												<Button
													type="button"
													onClick={() => handleSelect(ranger)}
													size="sm"
												>
													{mode === 'replace' ? 'Replace' : 'Select'}
												</Button>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}
					</div>

					{/* Footer with count */}
					<div className="border-t pt-3 text-sm text-muted-foreground">
						Showing {filteredRangers.length} of {rangers.length} rangers
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default ExistingRangerSelector;

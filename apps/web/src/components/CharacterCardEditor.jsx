import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';

const CharacterCardEditor = ({ 
	extraCharacters = [], 
	onCharactersChange,
	onReplaceCharacter 
}) => {
	const [isAdding, setIsAdding] = useState(false);
	const [editingIndex, setEditingIndex] = useState(null);
	const [currentCharacter, setCurrentCharacter] = useState({
		name: '',
		title: '',
		abilityName: '',
		ability: ''
	});

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setCurrentCharacter(prev => ({
			...prev,
			[name]: value
		}));
	};

	const handleSave = () => {
		if (!currentCharacter.name || !currentCharacter.abilityName || !currentCharacter.ability) {
			alert('Character name, ability name, and ability are required');
			return;
		}

		let updatedCharacters;
		if (editingIndex !== null) {
			// Update existing character
			updatedCharacters = extraCharacters.map((char, idx) => 
				idx === editingIndex ? { ...currentCharacter } : char
			);
			setEditingIndex(null);
		} else {
			// Add new character
			updatedCharacters = [...extraCharacters, { ...currentCharacter }];
		}

		onCharactersChange(updatedCharacters);
		setCurrentCharacter({ name: '', title: '', abilityName: '', ability: '' });
		setIsAdding(false);
	};

	const handleEdit = (index) => {
		setCurrentCharacter({ ...extraCharacters[index] });
		setEditingIndex(index);
		setIsAdding(true);
	};

	const handleRemove = (index) => {
		if (confirm('Are you sure you want to remove this character?')) {
			const updatedCharacters = extraCharacters.filter((_, idx) => idx !== index);
			onCharactersChange(updatedCharacters);
		}
	};

	const handleReplace = (index) => {
		if (onReplaceCharacter) {
			onReplaceCharacter(index);
		}
	};

	const handleCancel = () => {
		setCurrentCharacter({ name: '', title: '', abilityName: '', ability: '' });
		setEditingIndex(null);
		setIsAdding(false);
	};

	return (
		<div className="space-y-4">
			{extraCharacters.length === 0 && !isAdding && (
				<div className="text-center py-6 px-4 border-2 border-dashed rounded-lg border-muted-foreground/25">
					<p className="text-sm text-muted-foreground mb-3">
						No extra characters added yet. Add multiple character cards to represent different forms or abilities.
					</p>
					<Button type="button" onClick={() => setIsAdding(true)} size="sm">
						Add Character
					</Button>
				</div>
			)}

			{/* Add/Edit Form */}
			{isAdding && (
				<Card>
					<CardHeader>
						<CardTitle>{editingIndex !== null ? 'Edit Character' : 'Add New Character'}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="char-name">Character Name *</Label>
							<Input
								id="char-name"
								name="name"
								value={currentCharacter.name}
								onChange={handleInputChange}
								placeholder="e.g., Jason Lee Scott"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="char-title">Title</Label>
							<Input
								id="char-title"
								name="title"
								value={currentCharacter.title}
								onChange={handleInputChange}
								placeholder="e.g., Mighty Morphin Red"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="char-ability-name">Ability Name *</Label>
							<Input
								id="char-ability-name"
								name="abilityName"
								value={currentCharacter.abilityName}
								onChange={handleInputChange}
								placeholder="e.g., Leadership"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="char-ability">Ability Description *</Label>
							<Textarea
								id="char-ability"
								name="ability"
								value={currentCharacter.ability}
								onChange={handleInputChange}
								rows={4}
								placeholder="Once per battle..."
							/>
						</div>

						<div className="flex gap-2">
							<Button type="button" onClick={handleSave} className="flex-1">
								{editingIndex !== null ? 'Update Character' : 'Add Character'}
							</Button>
							<Button type="button" onClick={handleCancel} variant="secondary" className="flex-1">
								Cancel
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Characters List */}
			{extraCharacters.length > 0 && (
				<div className="space-y-3">
					<div className="flex justify-between items-center">
						<h4 className="text-sm font-medium text-muted-foreground">
							{extraCharacters.length} Extra Character{extraCharacters.length !== 1 ? 's' : ''}
						</h4>
						{!isAdding && (
							<Button type="button" onClick={() => setIsAdding(true)} size="sm" variant="outline">
								Add Character
							</Button>
						)}
					</div>
					<div className="space-y-3">
						{extraCharacters.map((character, index) => (
							<Card key={index}>
								<CardContent className="pt-6">
									<div className="space-y-2">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<h5 className="font-semibold">{character.name}</h5>
												{character.title && (
													<p className="text-sm text-muted-foreground">{character.title}</p>
												)}
											</div>
											<div className="flex gap-2">
												<Button
													type="button"
													size="sm"
													variant="ghost"
													onClick={() => handleEdit(index)}
													title="Edit"
												>
													<Pencil className="h-4 w-4" />
												</Button>
												{onReplaceCharacter && (
													<Button
														type="button"
														size="sm"
														variant="ghost"
														onClick={() => handleReplace(index)}
														title="Replace with official ranger"
													>
														<RefreshCw className="h-4 w-4" />
													</Button>
												)}
												<Button
													type="button"
													size="sm"
													variant="ghost"
													onClick={() => handleRemove(index)}
													title="Remove"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
										<div className="mt-2 p-3 bg-muted rounded-md">
											<p className="text-sm font-medium">{character.abilityName}</p>
											<p className="text-sm text-muted-foreground mt-1">{character.ability}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			)}

		</div>
	);
};

export default CharacterCardEditor;

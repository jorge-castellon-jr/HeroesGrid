import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import RangerCard from '../components/cards/RangerCard';
import CardEditorModal from '../components/CardEditorModal';

const CreateCustomRanger = () => {
	const navigate = useNavigate();
	const { showError, showSuccess, showWarning } = useDialog();
	const [teams, setTeams] = useState([]);
	const [formData, setFormData] = useState({
		name: '',
		username: 'local-user',
		title: '',
		cardTitle: '',
		color: 'red',
		type: 'core',
		abilityName: '',
		ability: '',
		teamId: '',
		customTeamName: '',
		teamPosition: 1,
		published: false,
	});
	const [deck, setDeck] = useState([]);
	const [editingCardIndex, setEditingCardIndex] = useState(null);
	const [isCardModalOpen, setIsCardModalOpen] = useState(false);
	const [currentCard, setCurrentCard] = useState({
		name: '',
		energyCost: '0',
		type: 'attack',
		description: '',
		shields: '0',
		attackDice: 0,
		attackHit: 0,
		count: 1,
	});

	const colors = ['red', 'blue', 'yellow', 'black', 'pink', 'green', 'white', 'gold', 'silver', 'purple', 'orange'];
	const types = [
		{ value: 'core', label: 'Core' },
		{ value: 'sixth', label: 'Sixth Ranger' },
		{ value: 'extra', label: 'Extra' },
		{ value: 'ally', label: 'Ally' },
	];
	const cardTypes = ['attack', 'maneuver', 'reaction'];

	useEffect(() => {
		const fetchTeams = async () => {
			const teamsCollection = database.get('teams');
			const fetchedTeams = await teamsCollection.query(Q.where('published', true)).fetch();
			setTeams(fetchedTeams);
		};
		fetchTeams();
	}, []);

	const generateSlug = (name) => {
		return name
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, '')
			.replace(/\s+/g, '-')
			.replace(/-+/g, '-');
	};

	const handleInputChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleCardChange = (e) => {
		const { name, value } = e.target;
		setCurrentCard((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const addCardToDeck = () => {
		if (!currentCard.name) {
			showWarning('Card name is required');
			return;
		}
		
		if (editingCardIndex !== null) {
			// Update existing card
			setDeck((prev) => prev.map((card, idx) => 
				idx === editingCardIndex ? { ...currentCard } : card
			));
			setEditingCardIndex(null);
		} else {
			// Add new card
			setDeck((prev) => [...prev, { ...currentCard }]);
		}
		
		setCurrentCard({
			name: '',
			energyCost: '0',
			type: 'attack',
			description: '',
			shields: '0',
			attackDice: 0,
			attackHit: 0,
			count: 1,
		});
		setIsCardModalOpen(false);
	};

	const editCard = (index) => {
		setCurrentCard({ ...deck[index] });
		setEditingCardIndex(index);
		setIsCardModalOpen(true);
	};

	const updateCardCount = (index, count) => {
		setDeck((prev) => prev.map((card, idx) => 
			idx === index ? { ...card, count } : card
		));
	};

	const removeCard = (index) => {
		setDeck((prev) => prev.filter((_, i) => i !== index));
	};

	const getTotalCardCount = () => {
		return deck.reduce((total, card) => total + (parseInt(card.count) || 1), 0);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.name) {
			showWarning('Ranger name is required');
			return;
		}

		if (!formData.teamId && !formData.customTeamName) {
			showWarning('Please select a team or enter a custom team name');
			return;
		}

		if (formData.teamId && formData.customTeamName) {
			showWarning('Please select either an official team OR a custom team name, not both');
			return;
		}

		try {
			const customRangersCollection = database.get('custom_rangers');
			const slug = generateSlug(formData.name);

			await database.write(async () => {
				await customRangersCollection.create((ranger) => {
					ranger.name = formData.name;
					ranger.slug = slug;
					ranger.username = formData.username;
					ranger.title = formData.title || null;
					ranger.cardTitle = formData.cardTitle || null;
					ranger.color = formData.color;
					ranger.type = formData.type;
					ranger.abilityName = formData.abilityName;
					ranger.ability = formData.ability;
					ranger.deck = JSON.stringify(deck);
					ranger.teamId = formData.teamId || null;
					ranger.customTeamName = formData.customTeamName || null;
					ranger.teamPosition = formData.teamPosition || null;
					ranger.published = formData.published;
					ranger.createdAt = Date.now();
					ranger.updatedAt = Date.now();
			});
		});

		showSuccess('Custom ranger created successfully!');
		setTimeout(() => navigate('/my-rangers'), 1000);
	} catch (error) {
		console.error('Error creating custom ranger:', error);
		showError('Failed to create custom ranger');
	}
	};

	return (
		<div className="container mx-auto px-4 py-8">
			<h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Create Custom Ranger</h1>

			<form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
				{/* Basic Info */}
				<div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
					<h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Basic Information</h2>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Name *</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								required
							/>
						</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Title</label>
								<input
									type="text"
									name="title"
									value={formData.title}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									placeholder="e.g., Leader, Warrior"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Card Title (Override)</label>
								<input
									type="text"
									name="cardTitle"
									value={formData.cardTitle}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									placeholder="e.g., MMPR Red Ranger"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Optional: Overrides title on deck cards</p>
							</div>

							<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Color *</label>
								<select
									name="color"
									value={formData.color}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								>
									{colors.map((color) => (
										<option key={color} value={color}>
											{color.charAt(0).toUpperCase() + color.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Type *</label>
								<select
									name="type"
									value={formData.type}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								>
									{types.map((t) => (
										<option key={t.value} value={t.value}>
											{t.label}
										</option>
									))}
								</select>
							</div>
						</div>
					</div>
				</div>

				{/* Team Assignment */}
				<div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
					<h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Team Assignment</h2>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Official Team</label>
							<select
								name="teamId"
								value={formData.teamId}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								disabled={!!formData.customTeamName}
							>
								<option value="">-- Select Team --</option>
								{teams.map((team) => (
									<option key={team.id} value={team.id}>
										{team.name}
									</option>
								))}
							</select>
						</div>

						<div className="text-center text-gray-500 dark:text-gray-400">OR</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Custom Team Name</label>
							<input
								type="text"
								name="customTeamName"
								value={formData.customTeamName}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								disabled={!!formData.teamId}
								placeholder="e.g., Custom Squad"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Team Position</label>
							<input
								type="number"
								name="teamPosition"
								value={formData.teamPosition}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								min="1"
							/>
						</div>
					</div>
				</div>

				{/* Ability */}
				<div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
					<h2 className="text-xl font-semibold mb-4 dark:text-gray-100">Ability</h2>

					<div className="space-y-4">
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Ability Name *</label>
							<input
								type="text"
								name="abilityName"
								value={formData.abilityName}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								required
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Ability Description *</label>
							<textarea
								name="ability"
								value={formData.ability}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								rows="4"
								required
							/>
						</div>
					</div>
				</div>

				{/* Deck Editor */}
				<div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
					<div className="flex justify-between items-center mb-4">
						<h2 className="text-xl font-semibold dark:text-gray-100">Deck ({getTotalCardCount()}/10 cards)</h2>
						<button
							type="button"
							onClick={() => setIsCardModalOpen(true)}
							className="bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold"
						>
							Add Card
						</button>
					</div>

					<CardEditorModal
						isOpen={isCardModalOpen}
						onClose={() => {
							setIsCardModalOpen(false);
							setEditingCardIndex(null);
							setCurrentCard({
								name: '',
								energyCost: '0',
								type: 'attack',
								description: '',
								shields: '0',
								attackDice: 0,
								attackHit: 0,
								count: 1,
							});
						}}
						card={currentCard}
						onCardChange={handleCardChange}
						onSave={addCardToDeck}
						isEditing={editingCardIndex !== null}
					/>

					<div className="space-y-4 mb-6 hidden">
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Card Name</label>
								<input
									type="text"
									name="name"
									value={currentCard.name}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
								<select
									name="type"
									value={currentCard.type}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								>
									{cardTypes.map((type) => (
										<option key={type} value={type}>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
							<textarea
								name="description"
								value={currentCard.description}
								onChange={handleCardChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								rows="2"
							/>
						</div>

						<div className="grid grid-cols-5 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Energy Cost</label>
								<input
									type="text"
									name="energyCost"
									value={currentCard.energyCost}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Shields</label>
								<input
									type="text"
									name="shields"
									value={currentCard.shields}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Dice</label>
								<input
									type="number"
									name="attackDice"
									value={currentCard.attackDice}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									min="0"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Hit</label>
								<input
									type="number"
									name="attackHit"
									value={currentCard.attackHit}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									min="0"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Count</label>
								<input
									type="number"
									name="count"
									value={currentCard.count}
									onChange={handleCardChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									min="1"
									max="10"
								/>
							</div>
						</div>

						<div className="flex gap-2">
							<button
								type="button"
								onClick={addCardToDeck}
								className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
							>
								{editingCardIndex !== null ? 'Update Card' : `Add Card to Deck (${getTotalCardCount()}/10)`}
							</button>
							{editingCardIndex !== null && (
								<button
									type="button"
									onClick={() => {
										setEditingCardIndex(null);
										setCurrentCard({
											name: '',
											energyCost: '0',
											type: 'attack',
											description: '',
											shields: '0',
											attackDice: 0,
											attackHit: 0,
											count: 1,
										});
									}}
									className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
								>
									Cancel
								</button>
							)}
						</div>
					</div>

					{/* Deck List */}
					{deck.length > 0 && (
						<div>
							<h3 className="font-semibold mb-3 dark:text-gray-100">Current Deck:</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{deck.map((card, index) => (
									<div key={index} className="border rounded-lg p-4 dark:border-gray-600 bg-white dark:bg-gray-800 flex flex-col">
										<div className="mb-3 flex-1">
											<RangerCard
												card={{
													name: card.name,
													cardTitle: formData.cardTitle || formData.title,
													type: card.type,
													color: formData.color.charAt(0).toUpperCase() + formData.color.slice(1),
													energy: card.energyCost,
													shields: card.shields,
													text: card.description ? [card.description] : [],
													attack: parseInt(card.attackDice) > 0 ? [{ value: parseInt(card.attackDice), fixed: false }] : [],
													team: formData.customTeamName || '',
												}}
											/>
										</div>
										<div className="flex items-center gap-2 pt-3 border-t dark:border-gray-600">
											<div className="flex items-center gap-2">
												<label className="text-sm text-gray-600 dark:text-gray-400">Count:</label>
												<input
													type="number"
													min="1"
													max="10"
													value={card.count || 1}
													onChange={(e) => updateCardCount(index, parseInt(e.target.value) || 1)}
													className="w-16 px-2 py-1 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
												/>
											</div>
											<div className="flex gap-2 ml-auto">
												<button
													type="button"
													onClick={() => editCard(index)}
													className="px-3 py-1 bg-blue-600 dark:bg-blue-500 text-white rounded text-sm hover:bg-blue-700 dark:hover:bg-blue-600"
												>
													Edit
												</button>
												<button
													type="button"
													onClick={() => removeCard(index)}
													className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
												>
													Remove
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Submit */}
				<div className="flex gap-4">
					<button
						type="submit"
						className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-semibold"
					>
						Create Ranger
					</button>
					<button
						type="button"
						onClick={() => navigate('/my-rangers')}
						className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 font-semibold dark:bg-gray-700"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);
};

export default CreateCustomRanger;

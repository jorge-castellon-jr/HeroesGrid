import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';
import RangerCard from '../components/cards/RangerCard';
import CardEditorModal from '../components/CardEditorModal';

const CustomRangerDetail = () => {
	const { slug } = useParams();
	const navigate = useNavigate();
	const { showError, showSuccess, showWarning, showConfirm } = useDialog();
	const [ranger, setRanger] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [teams, setTeams] = useState([]);
	const [formData, setFormData] = useState(null);
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
		fetchRanger();
		fetchTeams();
	}, [slug]);

	const fetchTeams = async () => {
		const teamsCollection = database.get('teams');
		const fetchedTeams = await teamsCollection.query(Q.where('published', true)).fetch();
		setTeams(fetchedTeams);
	};

	const fetchRanger = async () => {
		try {
			const customRangersCollection = database.get('custom_rangers');
			const fetchedRangers = await customRangersCollection.query(Q.where('slug', slug)).fetch();

			if (fetchedRangers.length === 0) {
				showError('Ranger not found');
				navigate('/my-rangers');
				return;
			}

			const rangerRecord = fetchedRangers[0];
			let teamName = rangerRecord.customTeamName;

			if (rangerRecord.teamId) {
				try {
					const team = await rangerRecord.team.fetch();
					teamName = team?.name || 'Unknown Team';
				} catch (err) {
					console.error('Error fetching team:', err);
					teamName = 'Unknown Team';
				}
			}

			const rangerData = {
				id: rangerRecord.id,
				name: rangerRecord.name,
				slug: rangerRecord.slug,
				title: rangerRecord.title,
				cardTitle: rangerRecord.cardTitle,
				color: rangerRecord.color,
				type: rangerRecord.type,
				abilityName: rangerRecord.abilityName,
				ability: rangerRecord.ability,
				teamId: rangerRecord.teamId || '',
				customTeamName: rangerRecord.customTeamName || '',
				teamName: teamName || 'No Team',
				teamPosition: rangerRecord.teamPosition,
				deck: JSON.parse(rangerRecord.deck || '[]'),
				createdAt: rangerRecord.createdAt,
				record: rangerRecord,
			};

			setRanger(rangerData);
		setFormData({
			name: rangerData.name,
			title: rangerData.title || '',
			cardTitle: rangerData.cardTitle || '',
			color: rangerData.color,
			type: rangerData.type,
			abilityName: rangerData.abilityName,
			ability: rangerData.ability,
			teamId: rangerData.teamId,
			customTeamName: rangerData.customTeamName,
			teamPosition: rangerData.teamPosition || 1,
		});
			setDeck(rangerData.deck);
		} catch (error) {
			console.error('Error fetching ranger:', error);
			showError('Failed to load ranger');
			navigate('/my-rangers');
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
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

	const handleSave = async () => {
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
			await database.write(async () => {
				await ranger.record.update((r) => {
					r.name = formData.name;
					r.title = formData.title || null;
					r.cardTitle = formData.cardTitle || null;
					r.color = formData.color;
					r.type = formData.type;
					r.abilityName = formData.abilityName;
					r.ability = formData.ability;
					r.deck = JSON.stringify(deck);
					r.teamId = formData.teamId || null;
					r.customTeamName = formData.customTeamName || null;
					r.teamPosition = formData.teamPosition || null;
					r.updatedAt = Date.now();
			});
		});

		showSuccess('Ranger updated successfully!');
		setIsEditing(false);
		await fetchRanger();
	} catch (error) {
		console.error('Error updating ranger:', error);
		showError('Failed to update ranger');
	}
	};

	const handleDelete = async () => {
		showConfirm(
			`Are you sure you want to delete "${ranger.name}"?`,
			async () => {
				try {
					await database.write(async () => {
						await ranger.record.destroyPermanently();
					});

					showSuccess('Ranger deleted successfully!');
					setTimeout(() => navigate('/my-rangers'), 1000);
				} catch (error) {
					console.error('Error deleting ranger:', error);
					showError('Failed to delete ranger');
				}
			},
			'Confirm Deletion',
			'Delete'
		);
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center dark:text-gray-100">Loading...</div>
			</div>
		);
	}

	if (!ranger) {
		return null;
	}

	if (isEditing) {
		return (
			<div className="container mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6 dark:text-gray-100">Edit Custom Ranger</h1>

				<div className="space-y-6 max-w-3xl">
					{/* Basic Info */}
					<div className="bg-white shadow-md rounded-lg p-6 dark:bg-gray-800">
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
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Card Title (Override)</label>
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
									<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Color *</label>
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
									<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Type *</label>
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
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Official Team</label>
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

							<div className="text-center text-gray-500 dark:text-gray-100 dark:text-gray-400">OR</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Custom Team Name</label>
								<input
									type="text"
									name="customTeamName"
									value={formData.customTeamName}
									onChange={handleInputChange}
									className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
									disabled={!!formData.teamId}
								/>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Team Position</label>
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
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Ability Name *</label>
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
								<label className="block text-sm font-medium mb-1 dark:text-gray-200 dark:text-gray-200">Ability Description *</label>
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
														team: formData.customTeamName || formData.teamName || '',
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

					{/* Actions */}
					<div className="flex gap-4">
						<button
							onClick={handleSave}
							className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-semibold"
						>
							Save Changes
						</button>
						<button
							onClick={() => {
								setIsEditing(false);
								fetchRanger();
							}}
							className="flex-1 bg-gray-500 text-white py-3 px-6 rounded-md hover:bg-gray-600 font-semibold dark:bg-gray-700"
						>
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="mb-6">
					<Link to="/my-rangers" className="text-blue-600 hover:text-blue-800 mb-4 inline-block dark:text-blue-400 dark:hover:text-blue-300">
						← Back to My Rangers
					</Link>
					<div className="flex justify-between items-start">
						<div>
							<h1 className="text-4xl font-bold mb-2 dark:text-gray-100">{ranger.name}</h1>
							{ranger.title && <p className="text-xl text-gray-600 dark:text-gray-300">{ranger.title}</p>}
						</div>
						<span className={`px-4 py-2 rounded ${getColor(ranger.color)} text-white font-semibold`}>
							{ranger.color.toUpperCase()}
						</span>
					</div>
				</div>

				{/* Basic Info */}
				<div className="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800">
					<h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Information</h2>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">Team</p>
							<p className="font-medium dark:text-gray-200">{ranger.teamName}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">Type</p>
							<p className="font-medium dark:text-gray-200">{ranger.type.charAt(0).toUpperCase() + ranger.type.slice(1)}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">Team Position</p>
							<p className="font-medium dark:text-gray-200">{ranger.teamPosition || 'N/A'}</p>
						</div>
						<div>
							<p className="text-sm text-gray-600 dark:text-gray-400 dark:text-gray-300">Created</p>
							<p className="font-medium dark:text-gray-200">{new Date(ranger.createdAt).toLocaleDateString()}</p>
						</div>
					</div>
				</div>

				{/* Ability */}
				<div className="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800">
					<h2 className="text-2xl font-semibold mb-2 dark:text-gray-100">{ranger.abilityName}</h2>
					<p className="text-gray-700 dark:text-gray-200">{ranger.ability}</p>
				</div>

				{/* Deck */}
				<div className="bg-white shadow-md rounded-lg p-6 mb-6 dark:bg-gray-800">
					<h2 className="text-2xl font-semibold mb-4 dark:text-gray-100">Deck ({ranger.deck.length} cards)</h2>
					{ranger.deck.length === 0 ? (
						<p className="text-gray-500 dark:text-gray-400">No cards in deck</p>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{ranger.deck.map((card, index) => (
								<div key={index} className="relative">
									<RangerCard
										card={{
											name: card.name,
											cardTitle: ranger.cardTitle || ranger.title,
											type: card.type,
											color: ranger.color.charAt(0).toUpperCase() + ranger.color.slice(1),
											energy: card.energyCost,
											shields: card.shields,
											text: card.description ? [card.description] : [],
											attack: parseInt(card.attackDice) > 0 ? [{ value: parseInt(card.attackDice), fixed: false }] : [],
											team: ranger.teamName,
										}}
									/>
									{(card.count && card.count > 1) && (
										<div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded-full text-sm font-bold">
											×{card.count}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Actions */}
				<div className="flex gap-4">
					<button
						onClick={() => setIsEditing(true)}
						className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 font-semibold"
					>
						Edit Ranger
					</button>
					<button
						onClick={handleDelete}
						className="bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 font-semibold"
					>
						Delete
					</button>
				</div>
			</div>
		</div>
	);
};

export default CustomRangerDetail;

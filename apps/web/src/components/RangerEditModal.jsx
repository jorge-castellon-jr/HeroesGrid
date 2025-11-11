import { useState, useEffect } from 'react';
import { database } from '../database';

const RangerEditModal = ({ ranger, onClose, onSave }) => {
	const [relationData, setRelationData] = useState({ teams: [], expansions: [] });
	const [editingItem, setEditingItem] = useState(null);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		loadRelationData();
		
		if (ranger) {
			setEditingItem({
				id: ranger.id,
				name: ranger.name,
				slug: ranger.slug,
				title: ranger.title,
				cardTitle: ranger.cardTitle,
				color: ranger.color,
				abilityName: ranger.abilityName,
				ability: ranger.ability,
				imageUrl: ranger.imageUrl,
				type: ranger.type,
				teamPosition: ranger.teamPosition,
				isOncePerBattle: ranger.isOncePerBattle,
				teamId: ranger.teamId,
				expansionId: ranger.expansionId,
				published: ranger.published,
			});
		}
	}, [ranger]);

	const loadRelationData = async () => {
		try {
			const [teams, expansions] = await Promise.all([
				database.get('teams').query().fetch(),
				database.get('expansions').query().fetch(),
			]);
			setRelationData({ teams, expansions });
		} catch (error) {
			console.error('Error loading relation data:', error);
		}
	};

	const handleSave = async () => {
		if (!editingItem) return;
		
		try {
			setIsSaving(true);
			await database.write(async () => {
				const record = await database.get('rangers').find(editingItem.id);
				await record.update((r) => {
					r.name = editingItem.name;
					r.slug = editingItem.slug;
					r.title = editingItem.title;
					r.cardTitle = editingItem.cardTitle;
					r.color = editingItem.color;
					r.abilityName = editingItem.abilityName;
					r.ability = editingItem.ability;
					r.imageUrl = editingItem.imageUrl;
					r.type = editingItem.type;
					r.teamPosition = editingItem.teamPosition;
					r.isOncePerBattle = editingItem.isOncePerBattle;
					r.teamId = editingItem.teamId;
					r.expansionId = editingItem.expansionId;
					r.published = editingItem.published;
				});
			});
			
			if (onSave) {
				await onSave();
			}
			onClose();
		} catch (error) {
			console.error('Error saving:', error);
			alert('Error saving: ' + error.message);
		} finally {
			setIsSaving(false);
		}
	};

	// Add keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && !isSaving) {
				onClose();
			} else if (e.key === 'Enter' && !isSaving && !e.target.matches('textarea')) {
				// Don't trigger on Enter in textarea (for multi-line input)
				e.preventDefault();
				handleSave();
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [isSaving, onClose, handleSave]);

	if (!editingItem) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
			<div 
				className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="p-6">
					<h2 className="text-2xl font-bold mb-4 dark:text-white">Edit {editingItem.name}</h2>

					<div className="space-y-4">
						{/* Name */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Name</label>
							<input
								type="text"
								value={editingItem.name || ''}
								onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Title */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Title</label>
							<input
								type="text"
								value={editingItem.title || ''}
								onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Card Title Override */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Card Title (Override)</label>
							<input
								type="text"
								value={editingItem.cardTitle || ''}
								onChange={(e) => setEditingItem({ ...editingItem, cardTitle: e.target.value })}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Type & Color Row */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
								<select
									value={editingItem.type || ''}
									onChange={(e) => setEditingItem({ ...editingItem, type: e.target.value })}
									className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								>
									<option value="core">Core</option>
									<option value="sixth">Sixth</option>
									<option value="extra">Extra</option>
									<option value="ally">Ally</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Color</label>
								<select
									value={editingItem.color || ''}
									onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
									className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								>
									<option value="red">Red</option>
									<option value="blue">Blue</option>
									<option value="black">Black</option>
									<option value="green">Green</option>
									<option value="yellow">Yellow</option>
									<option value="pink">Pink</option>
									<option value="white">White</option>
									<option value="gold">Gold</option>
									<option value="silver">Silver</option>
									<option value="purple">Purple</option>
									<option value="orange">Orange</option>
								</select>
							</div>
						</div>

						{/* Team Position */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Team Position</label>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setEditingItem({ ...editingItem, teamPosition: Math.round(((editingItem.teamPosition || 0) - 0.1) * 10) / 10 })}
									className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
								>
									−
								</button>
								<input
									type="number"
									step="any"
									value={editingItem.teamPosition || ''}
									onChange={(e) => setEditingItem({ ...editingItem, teamPosition: parseFloat(e.target.value) || null })}
									className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
									placeholder="Auto-assigned based on type/color"
								/>
								<button
									type="button"
									onClick={() => setEditingItem({ ...editingItem, teamPosition: Math.round(((editingItem.teamPosition || 0) + 0.1) * 10) / 10 })}
									className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500 font-bold"
								>
									+
								</button>
							</div>
						</div>

						{/* Ability Name */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Ability Name</label>
							<input
								type="text"
								value={editingItem.abilityName || ''}
								onChange={(e) => setEditingItem({ ...editingItem, abilityName: e.target.value })}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Ability Description */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Ability Description</label>
							<textarea
								value={editingItem.ability || ''}
								onChange={(e) => setEditingItem({ ...editingItem, ability: e.target.value })}
								rows={3}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Team & Expansion */}
						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Team</label>
								<select
									value={editingItem.teamId || ''}
									onChange={(e) => setEditingItem({ ...editingItem, teamId: e.target.value })}
									className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								>
									<option value="">Select team...</option>
									{relationData.teams.map(team => (
										<option key={team.id} value={team.id}>{team.name}</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium mb-1 dark:text-gray-200">Expansion</label>
								<select
									value={editingItem.expansionId || ''}
									onChange={(e) => setEditingItem({ ...editingItem, expansionId: e.target.value })}
									className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								>
									<option value="">Select expansion...</option>
									{relationData.expansions.map(expansion => (
										<option key={expansion.id} value={expansion.id}>{expansion.name}</option>
									))}
								</select>
							</div>
						</div>

						{/* Image URL */}
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Image URL</label>
							<input
								type="text"
								value={editingItem.imageUrl || ''}
								onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
								className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
							/>
						</div>

						{/* Checkboxes */}
						<div className="flex gap-4">
							<div className="flex items-center">
								<input
									type="checkbox"
									id="isOncePerBattle"
									checked={editingItem.isOncePerBattle || false}
									onChange={(e) => setEditingItem({ ...editingItem, isOncePerBattle: e.target.checked })}
									className="mr-2"
								/>
								<label htmlFor="isOncePerBattle" className="text-sm font-medium dark:text-gray-200">Once Per Battle</label>
							</div>

							<div className="flex items-center">
								<input
									type="checkbox"
									id="published"
									checked={editingItem.published || false}
									onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
									className="mr-2"
								/>
								<label htmlFor="published" className="text-sm font-medium dark:text-gray-200">Published</label>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex justify-end space-x-3 mt-6">
						<button
							onClick={onClose}
							disabled={isSaving}
							className="px-4 py-2 border rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
						>
							Cancel
						</button>
						<button
							onClick={handleSave}
							disabled={isSaving}
							className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
						>
							{isSaving ? 'Saving...' : 'Save Changes'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RangerEditModal;

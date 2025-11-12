const CardEditorModal = ({ 
	isOpen, 
	onClose, 
	card, 
	onCardChange, 
	onSave, 
	isEditing 
}) => {
	const cardTypes = ['attack', 'maneuver', 'reaction'];

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
			<div 
				className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">
					<h2 className="text-2xl font-bold dark:text-gray-100">
						{isEditing ? 'Edit Card' : 'Add Card'}
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="p-6 space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1 dark:text-gray-200">Card Name *</label>
						<input
							type="text"
							name="name"
							value={card.name}
							onChange={onCardChange}
							className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							placeholder="e.g., Power Strike"
						/>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1 dark:text-gray-200">Type</label>
						<select
							name="type"
							value={card.type}
							onChange={onCardChange}
							className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
						>
							{cardTypes.map((type) => (
								<option key={type} value={type}>
									{type.charAt(0).toUpperCase() + type.slice(1)}
								</option>
							))}
						</select>
					</div>

					<div>
						<label className="block text-sm font-medium mb-1 dark:text-gray-200">Description</label>
						<textarea
							name="description"
							value={card.description}
							onChange={onCardChange}
							className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							rows="3"
							placeholder="Card effect description..."
						/>
					</div>

					<div className="grid grid-cols-5 gap-4">
						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Energy Cost</label>
							<input
								type="text"
								name="energyCost"
								value={card.energyCost}
								onChange={onCardChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Shields</label>
							<input
								type="text"
								name="shields"
								value={card.shields}
								onChange={onCardChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Dice</label>
							<input
								type="number"
								name="attackDice"
								value={card.attackDice}
								onChange={onCardChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								min="0"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Attack Hit</label>
							<input
								type="number"
								name="attackHit"
								value={card.attackHit}
								onChange={onCardChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								min="0"
							/>
						</div>

						<div>
							<label className="block text-sm font-medium mb-1 dark:text-gray-200">Count</label>
							<input
								type="number"
								name="count"
								value={card.count}
								onChange={onCardChange}
								className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
								min="1"
								max="10"
							/>
						</div>
					</div>
				</div>

				<div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-6 py-4 flex gap-3">
					<button
						onClick={onSave}
						className="flex-1 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 font-semibold"
					>
						{isEditing ? 'Update Card' : 'Add Card'}
					</button>
					<button
						onClick={onClose}
						className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 font-semibold"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
};

export default CardEditorModal;

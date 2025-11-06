import { useState, useEffect } from 'react';
import { database } from '../database';
import { initializeDatabase } from '../database/seed';

export default function Admin() {
	const [activeTab, setActiveTab] = useState('rangers');
	const [data, setData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editingItem, setEditingItem] = useState(null);
	const [searchTerm, setSearchTerm] = useState('');

	const tabs = [
		{ id: 'rangers', label: 'Rangers', collection: 'rangers' },
		{ id: 'teams', label: 'Teams', collection: 'teams' },
		{ id: 'enemies', label: 'Enemies', collection: 'enemies' },
		{ id: 'expansions', label: 'Expansions', collection: 'expansions' },
		{ id: 'seasons', label: 'Seasons', collection: 'seasons' },
		{ id: 'cards', label: 'Ranger Cards', collection: 'ranger_cards' },
	];

	useEffect(() => {
		loadData();
	}, [activeTab]);

	const loadData = async () => {
		setIsLoading(true);
		try {
			await initializeDatabase();
			const collection = database.get(tabs.find(t => t.id === activeTab).collection);
			const records = await collection.query().fetch();
			setData(records);
		} catch (error) {
			console.error('Error loading data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = (item) => {
		// Extract all fields from WatermelonDB model
		const editData = {
			id: item.id,
			name: item.name,
			slug: item.slug,
			published: item.published,
		};
		
		// Add ranger-specific fields if applicable
		if (activeTab === 'rangers') {
			editData.title = item.title;
			editData.cardTitle = item.cardTitle;
			editData.color = item.color;
			editData.abilityName = item.abilityName;
			editData.ability = item.ability;
			editData.imageUrl = item.imageUrl;
		}
		
		setEditingItem(editData);
	};

	const handleSave = async () => {
		try {
			await database.write(async () => {
				const record = await database.get(tabs.find(t => t.id === activeTab).collection).find(editingItem.id);
				await record.update((r) => {
					// Update all fields from editingItem
					Object.keys(editingItem).forEach(key => {
						if (key !== 'id' && key !== '_raw' && typeof editingItem[key] !== 'function') {
							r[key] = editingItem[key];
						}
					});
				});
			});
			setEditingItem(null);
			loadData();
		} catch (error) {
			console.error('Error saving:', error);
			alert('Error saving: ' + error.message);
		}
	};

	const handleTogglePublished = async (itemId, currentValue) => {
		try {
			const collection = database.get(tabs.find(t => t.id === activeTab).collection);
			let updatedRecord;
			await database.write(async () => {
				const record = await collection.find(itemId);
				updatedRecord = await record.update((r) => {
					r.published = !currentValue;
				});
			});
			// Replace the record in local state with the updated WatermelonDB record
			setData(prevData => 
				prevData.map(item => 
					item.id === itemId ? updatedRecord : item
				)
			);
		} catch (error) {
			console.error('Error toggling published status:', error);
			alert('Error updating published status: ' + error.message);
		}
	};

	const handleExportJSON = async () => {
		try {
			const collection = database.get(tabs.find(t => t.id === activeTab).collection);
			const records = await collection.query().fetch();
			
			const jsonData = records.map(r => {
				// Use _raw to get the plain data without circular references
				const obj = { ...r._raw };
				// Remove internal fields
				delete obj._status;
				delete obj._changed;
				return obj;
			});

			const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${activeTab}.json`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (error) {
			console.error('Error exporting:', error);
			alert('Error exporting: ' + error.message);
		}
	};

	const filteredData = data.filter(item => {
		const searchLower = searchTerm.toLowerCase();
		return item.name?.toLowerCase().includes(searchLower) ||
		       item.slug?.toLowerCase().includes(searchLower) ||
		       item.title?.toLowerCase().includes(searchLower);
	});

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-lg">Loading...</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto py-8 px-4">
			<div className="mb-8">
				<h1 className="text-3xl font-bold mb-4">Data Admin</h1>
				<p className="text-gray-600">Manage and edit game data</p>
			</div>

			{/* Tabs */}
			<div className="flex space-x-2 mb-6 overflow-x-auto">
				{tabs.map(tab => (
					<button
						key={tab.id}
						onClick={() => setActiveTab(tab.id)}
						className={`px-4 py-2 rounded-lg whitespace-nowrap ${
							activeTab === tab.id
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-700 hover:bg-gray-300'
						}`}
					>
						{tab.label}
					</button>
				))}
			</div>

			{/* Actions */}
			<div className="flex justify-between items-center mb-6 gap-4">
				<input
					type="text"
					placeholder="Search by name, slug, or title..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<button
					onClick={handleExportJSON}
					className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
				>
					Export JSON
				</button>
			</div>

			{/* Data Count */}
			<p className="mb-4 text-sm text-gray-600">
				Showing {filteredData.length} of {data.length} records
			</p>

			{/* Data Table */}
			<div className="bg-white rounded-lg shadow overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-100">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
								<th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
								<th className="px-4 py-3 text-left text-sm font-semibold">Slug</th>
								{activeTab === 'rangers' && (
									<>
										<th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">Ability</th>
										<th className="px-4 py-3 text-left text-sm font-semibold">Color</th>
									</>
								)}
								<th className="px-4 py-3 text-left text-sm font-semibold">Published</th>
								<th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredData.map((item) => (
								<tr key={item.id} className="hover:bg-gray-50">
									<td className="px-4 py-3 text-sm text-gray-500">{item.id.slice(0, 8)}...</td>
									<td className="px-4 py-3 text-sm font-medium">{item.name}</td>
									<td className="px-4 py-3 text-sm text-gray-600">{item.slug}</td>
									{activeTab === 'rangers' && (
										<>
											<td className="px-4 py-3 text-sm text-gray-600">{item.title}</td>
											<td className="px-4 py-3 text-sm text-gray-600">{item.abilityName}</td>
											<td className="px-4 py-3 text-sm">
												<span className={`px-2 py-1 rounded text-xs ${
													item.color ? 'bg-gray-200' : ''
												}`}>
													{item.color || '-'}
												</span>
											</td>
										</>
									)}
									<td className="px-4 py-3 text-sm">
										<input
											type="checkbox"
											checked={item.published || false}
											onChange={() => handleTogglePublished(item.id, item.published)}
											className="h-4 w-4 cursor-pointer"
										/>
									</td>
									<td className="px-4 py-3 text-right">
										<button
											onClick={() => handleEdit(item)}
											className="text-blue-600 hover:text-blue-800 text-sm font-medium"
										>
											Edit
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Edit Modal */}
			{editingItem && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
						<div className="p-6">
							<h2 className="text-2xl font-bold mb-4">Edit {editingItem.name}</h2>
							
							<div className="space-y-4">
								{/* Basic Fields */}
								<div>
									<label className="block text-sm font-medium mb-1">Name</label>
									<input
										type="text"
										value={editingItem.name || ''}
										onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
										className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-1">Slug</label>
									<input
										type="text"
										value={editingItem.slug || ''}
										onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
										className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
									/>
								</div>

								{/* Published field - all tables */}
								<div className="flex items-center">
									<input
										type="checkbox"
										id="published"
										checked={editingItem.published || false}
										onChange={(e) => setEditingItem({ ...editingItem, published: e.target.checked })}
										className="mr-2"
									/>
									<label htmlFor="published" className="text-sm font-medium">Published</label>
								</div>

								{/* Ranger-specific fields */}
								{activeTab === 'rangers' && (
									<>
										<div>
											<label className="block text-sm font-medium mb-1">Title</label>
											<input
												type="text"
												value={editingItem.title || ''}
												onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
												className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Card Title (Override)</label>
											<input
												type="text"
												value={editingItem.cardTitle || ''}
												onChange={(e) => setEditingItem({ ...editingItem, cardTitle: e.target.value })}
												className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Color</label>
											<select
												value={editingItem.color || ''}
												onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
												className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
											>
												<option value="">Select color...</option>
												<option value="red">Red</option>
												<option value="blue">Blue</option>
												<option value="yellow">Yellow</option>
												<option value="black">Black</option>
												<option value="pink">Pink</option>
												<option value="green">Green</option>
												<option value="white">White</option>
												<option value="gold">Gold</option>
												<option value="silver">Silver</option>
												<option value="purple">Purple</option>
												<option value="orange">Orange</option>
											</select>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Ability Name</label>
											<input
												type="text"
												value={editingItem.abilityName || ''}
												onChange={(e) => setEditingItem({ ...editingItem, abilityName: e.target.value })}
												className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Ability Description</label>
											<textarea
												value={editingItem.ability || ''}
												onChange={(e) => setEditingItem({ ...editingItem, ability: e.target.value })}
												rows={3}
												className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>

										<div>
											<label className="block text-sm font-medium mb-1">Image URL</label>
											<input
												type="text"
												value={editingItem.imageUrl || ''}
												onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
												className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
											/>
										</div>
									</>
								)}
							</div>

							<div className="flex justify-end space-x-3 mt-6">
								<button
									onClick={() => setEditingItem(null)}
									className="px-4 py-2 border rounded-lg hover:bg-gray-100"
								>
									Cancel
								</button>
								<button
									onClick={handleSave}
									className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
								>
									Save Changes
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

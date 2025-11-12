import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { database } from '../database';
import { getColor } from '../utils/helpers';
import { useDialog } from '../contexts/DialogContext';

const MyRangers = () => {
	const [customRangers, setCustomRangers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const { showError, showSuccess, showWarning, showConfirm } = useDialog();

	useEffect(() => {
		fetchCustomRangers();
	}, []);

	const fetchCustomRangers = async () => {
		try {
			const customRangersCollection = database.get('custom_rangers');
			const fetchedRangers = await customRangersCollection.query().fetch();

			// Transform to include team info
			const transformedRangers = await Promise.all(
				fetchedRangers.map(async (ranger) => {
					let teamName = ranger.customTeamName;
					if (ranger.teamId) {
						try {
							const team = await ranger.team.fetch();
							teamName = team?.name || 'Unknown Team';
						} catch (err) {
							console.error('Error fetching team:', err);
							teamName = 'Unknown Team';
						}
					}

					return {
						id: ranger.id,
						name: ranger.name,
						slug: ranger.slug,
						color: ranger.color,
						type: ranger.type,
						teamName: teamName || 'No Team',
						abilityName: ranger.abilityName,
						deck: JSON.parse(ranger.deck || '[]'),
						createdAt: ranger.createdAt,
					};
				})
			);

			// Sort by creation date (newest first)
			transformedRangers.sort((a, b) => b.createdAt - a.createdAt);

			setCustomRangers(transformedRangers);
		} catch (error) {
			console.error('Error fetching custom rangers:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDelete = async (id, name) => {
		showConfirm(
			`Are you sure you want to delete "${name}"?`,
			async () => {
				try {
					const customRangersCollection = database.get('custom_rangers');
					const ranger = await customRangersCollection.find(id);

					await database.write(async () => {
						await ranger.destroyPermanently();
					});

					// Refresh the list
					await fetchCustomRangers();
					showSuccess('Custom ranger deleted successfully!');
				} catch (error) {
					console.error('Error deleting custom ranger:', error);
					showError('Failed to delete custom ranger');
				}
			},
			'Confirm Deletion',
			'Delete'
		);
	};

	const exportRangers = () => {
		const dataStr = JSON.stringify(customRangers, null, 2);
		const dataBlob = new Blob([dataStr], { type: 'application/json' });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `my-rangers-${Date.now()}.json`;
		link.click();
		URL.revokeObjectURL(url);
	};

	const importRangers = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		try {
			const text = await file.text();
			const importedData = JSON.parse(text);

			if (!Array.isArray(importedData)) {
				showError('Invalid file format');
				return;
			}

			const customRangersCollection = database.get('custom_rangers');

			await database.write(async () => {
				for (const rangerData of importedData) {
					await customRangersCollection.create((ranger) => {
						ranger.name = rangerData.name;
						ranger.slug = rangerData.slug;
						ranger.username = 'local-user';
						ranger.title = rangerData.title || null;
						ranger.color = rangerData.color;
						ranger.type = rangerData.type;
						ranger.abilityName = rangerData.abilityName;
						ranger.ability = rangerData.ability || '';
						ranger.deck = JSON.stringify(rangerData.deck || []);
						ranger.teamId = rangerData.teamId || null;
						ranger.customTeamName = rangerData.customTeamName || rangerData.teamName || null;
						ranger.teamPosition = rangerData.teamPosition || null;
						ranger.published = false;
						ranger.createdAt = Date.now();
						ranger.updatedAt = Date.now();
					});
				}
			});

			await fetchCustomRangers();
			showSuccess(`Successfully imported ${importedData.length} rangers!`);
		} catch (error) {
			console.error('Error importing rangers:', error);
			showError('Failed to import rangers. Please check the file format.');
		}
	};

	if (isLoading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="text-center dark:text-gray-100">Loading...</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold dark:text-gray-100">My Custom Rangers</h1>
				<div className="flex gap-3">
					<label className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 cursor-pointer">
						Import
						<input type="file" accept=".json" onChange={importRangers} className="hidden" />
					</label>
					{customRangers.length > 0 && (
						<button
							onClick={exportRangers}
							className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
						>
							Export All
						</button>
					)}
					<Link
						to="/rangers/create"
						className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
					>
						Create New Ranger
					</Link>
				</div>
			</div>

			{customRangers.length === 0 ? (
				<div className="text-center py-12 dark:text-gray-100">
					<p className="text-gray-600 text-lg mb-4 dark:text-gray-300 dark:text-gray-100">You haven't created any custom rangers yet.</p>
					<Link
						to="/rangers/create"
						className="inline-block bg-purple-600 text-white py-3 px-6 rounded-md hover:bg-purple-700 font-semibold"
					>
						Create Your First Ranger
					</Link>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{customRangers.map((ranger) => (
						<div key={ranger.id} className="bg-white shadow-md rounded-lg overflow-hidden dark:bg-gray-800">
							<div className={`h-2 ${getColor(ranger.color)}`}></div>
							<div className="p-6">
								<div className="flex justify-between items-start mb-3">
									<h2 className="text-xl font-bold dark:text-gray-100">{ranger.name}</h2>
									<span
										className={`text-xs px-2 py-1 rounded ${getColor(ranger.color)} text-white`}
									>
										{ranger.color.toUpperCase()}
									</span>
								</div>

								<div className="space-y-2 text-sm text-gray-600 mb-4 dark:text-gray-400 dark:text-gray-300">
									<p>
										<span className="font-semibold">Team:</span> {ranger.teamName}
									</p>
									<p>
										<span className="font-semibold">Type:</span>{' '}
										{ranger.type.charAt(0).toUpperCase() + ranger.type.slice(1)}
									</p>
									<p>
										<span className="font-semibold">Ability:</span> {ranger.abilityName}
									</p>
									<p>
										<span className="font-semibold">Deck Size:</span> {ranger.deck.length} cards
									</p>
								</div>

								<div className="flex gap-2">
									<Link
										to={`/my-rangers/${ranger.slug}`}
										className="flex-1 text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 dark:text-gray-100"
									>
										View Details
									</Link>
									<button
										onClick={() => handleDelete(ranger.id, ranger.name)}
										className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
									>
										Delete
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyRangers;

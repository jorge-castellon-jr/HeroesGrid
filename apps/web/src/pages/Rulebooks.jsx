import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getColor } from '../utils/helpers';
import database from '../database';
import { initializeDatabase } from '../database/seed';
import { Card, CardContent } from '@/components/ui/card';

export default function Rulebooks() {
	const [rulebooks, setRulebooks] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchRulebooks = async () => {
			try {
				setLoading(true);
				// Initialize database with seed data
				await initializeDatabase();
				
				// Fetch all rulebooks
				const rulebooksCollection = database.get('rulebooks');
				const data = await rulebooksCollection.query().fetch();
				console.log('📚 Fetched rulebooks:', data);
				console.log('📚 Rulebooks count:', data.length);
				data.forEach(book => {
					console.log('📖 Book:', {
						id: book.id,
						slug: book._raw.slug,
						name: book._raw.name,
						contentLength: book._raw.content?.length
					});
				});
				setRulebooks(data);
			} catch (error) {
				console.error('Error loading rulebooks:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchRulebooks();
	}, []);

	if (loading) {
		return (
			<div className="max-w-3xl px-4 mx-auto">
				<h2 className="text-center">All Rulebooks</h2>
				<p className="text-center">Loading...</p>
			</div>
		);
	}

	return (
		<div className="max-w-3xl px-4 mx-auto">
			<h2 className="text-center dark:text-gray-100">All Rulebooks</h2>
			{rulebooks.length > 0 && (
				<div className="flex flex-wrap justify-around w-full max-w-5xl mx-auto ranger-teams">
					{rulebooks.map((rulebook, i) => (
						<Link
							key={i}
							to={`/rulebooks/${rulebook._raw.slug}`}
							className="w-2/5 my-6 md:w-1/5"
						>
							<Card className="h-full overflow-hidden transition-transform hover:scale-105">
								<div
									className={`h-48 w-full flex-none bg-cover bg-center ${getColor()}`}
									style={{ backgroundImage: `url(/uploads/${rulebook._raw.slug}.png)` }}
								></div>
								<CardContent className="p-4">
									<p className="font-bold text-center uppercase text-md">
										{rulebook._raw.name}
									</p>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import marked from 'marked';
import { Q } from '@nozbe/watermelondb';
import database from '../database';
import { initializeDatabase } from '../database/seed';
import './RulebookSingle.css';

export default function RulebookSingle() {
	const { slug } = useParams();
	const [rulebook, setRulebook] = useState({ content: '' });

	useEffect(() => {
		const fetchRulebook = async () => {
			try {
				// Initialize database with seed data
				await initializeDatabase();
				
				// Fetch rulebook by slug
				const rulebooksCollection = database.get('rulebooks');
				const results = await rulebooksCollection
					.query(Q.where('slug', slug))
					.fetch();
				
				if (results.length > 0) {
					setRulebook(results[0]);
				}
			} catch (error) {
				console.error('Error fetching rulebook:', error);
			}
		};

		fetchRulebook();
	}, [slug]);

	const compiledMD = rulebook._raw?.content ? marked(rulebook._raw.content) : '';

	return (
		<div className="max-w-3xl px-3 mx-auto">
			<div dangerouslySetInnerHTML={{ __html: compiledMD }} />
		</div>
	);
}

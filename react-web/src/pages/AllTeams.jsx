import { useState, useEffect } from 'react';
import RangerTeams from '../components/RangerTeams';
import { database } from '../database';

export default function AllTeams() {
	const [teams, setTeams] = useState([]);

	useEffect(() => {
		const fetchTeams = async () => {
			try {
				const teamsCollection = database.get('teams');
				const fetchedTeams = await teamsCollection.query().fetch();
				
				// Transform to match component structure
				const transformedTeams = fetchedTeams.map(t => ({
					_id: t.id,
					name: t.name,
					slug: { current: t.slug }
				}));
				
				setTeams(transformedTeams);
			} catch (error) {
				console.error('Error fetching teams:', error);
			}
		};

		fetchTeams();
	}, []);

	return <RangerTeams teams={teams} />;
}

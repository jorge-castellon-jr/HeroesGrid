import { useState, useEffect } from 'react';
import RangerTeams from '../components/RangerTeams';

export default function AllTeams() {
	const [teams, setTeams] = useState([]);

	useEffect(() => {
		// TODO: Fetch teams from database
		// For now using placeholder
		const fetchTeams = async () => {
			// This will need to be implemented when we add teams to WatermelonDB
			setTeams([]);
		};

		fetchTeams();
	}, []);

	return <RangerTeams teams={teams} />;
}

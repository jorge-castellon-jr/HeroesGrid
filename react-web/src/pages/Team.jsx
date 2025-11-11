import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';

export default function Team() {
	const { team: teamParam } = useParams();
	const { setLoadingState } = useApp();
	const [team, setTeam] = useState('');
	const [rangers, setRangers] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const teamsCollection = database.get('teams');
				const rangersCollection = database.get('rangers');
				
				// Find team by slug
				const teams = await teamsCollection
					.query(Q.where('slug', teamParam))
					.fetch();
				
				if (teams.length === 0) {
					console.error('Team not found');
					setLoadingState(false);
					return;
				}
				
				const teamRecord = teams[0];
				
				// Get all rangers for this team
				const teamRangers = await rangersCollection
					.query(
						Q.where('team_id', teamRecord.id),
						Q.where('published', true)
					)
					.fetch();
				
				// Transform rangers to match component structure
				const transformedRangers = teamRangers.map(r => ({
					_id: r.id,
					name: r.name,
					rangerInfo: {
						slug: r.slug,
						team: teamRecord.name,
						color: r.color,
						teamPosition: r.teamPosition,
						cardTitle: r.cardTitle,
						title: r.title
					},
					rangerCards: {
						image: r.imageUrl,
						abilityName: r.abilityName,
						abilityDesc: r.abilityDesc
					}
				}));
				
				// Sort by team position
				transformedRangers.sort((a, b) => {
					const posA = a.rangerInfo.teamPosition || 999;
					const posB = b.rangerInfo.teamPosition || 999;
					return posA - posB;
				});
				
				setTeam(teamRecord.name);
				setRangers(transformedRangers);
				
				setTimeout(() => setLoadingState(false), 500);
			} catch (error) {
				console.error('Error fetching team:', error);
				setLoadingState(false);
			}
		};

		fetchData();
	}, [teamParam, setLoadingState]);

	const friendlyURL = (text) => {
		return text.toLowerCase().replace(' ', '-');
	};

	return (
		<div className="flex flex-col">
			<h2>
				{team}
				<br />
				Power Rangers
			</h2>
			<div className="flex flex-wrap justify-around -mx-3" id="rangersTeam">
				{rangers.map((ranger, i) => (
					<Link
						key={ranger._id}
						className={`no-underline px-3 py-6 md:px-6 w-1/2 flex ${
							i % 2 === 0 ? 'justify-end' : 'justify-start'
						}`}
						to={`/${friendlyURL(team + '/' + ranger.rangerInfo.slug)}`}
					>
						<RangerCard className="lg:max-w-lg" noDesc ranger={ranger} sanity />
					</Link>
				))}
			</div>
		</div>
	);
}

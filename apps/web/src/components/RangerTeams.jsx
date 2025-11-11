import { Link } from 'react-router-dom';
import { friendlyURL } from '../utils/helpers';
import './RangerTeams.css';

export default function RangerTeams({ teams = [] }) {
	return (
		<div className="flex flex-wrap justify-around max-w-3xl -mx-3 md:mx-auto ranger-teams" id="allTeams">
			{teams.map((team, i) => (
				<div
					key={i}
					className="flex w-1/2 px-3 my-3"
					id={friendlyURL(team.team)}
				>
					<Link
						to={`/${friendlyURL(team.team)}`}
						className="flex flex-col justify-end p-4 bg-white border border-gray-400 rounded-lg shadow-lg"
					>
						<div className="flex items-center flex-grow mx-auto my-2">
							<img 
								src={`/uploads/${friendlyURL(team.team)}.png`} 
								alt={team.team}
							/>
						</div>
						<div className="text-center">{team.team}</div>
					</Link>
				</div>
			))}
		</div>
	);
}

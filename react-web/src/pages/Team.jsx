import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import sanity from '../lib/sanityClient';

export default function Team() {
	const { team: teamParam } = useParams();
	const { setLoadingState } = useApp();
	const [team, setTeam] = useState('');
	const [rangers, setRangers] = useState([]);

	useEffect(() => {
		const fetchData = async () => {
			const query = `*[_type == 'team' && slug.current == '${teamParam}'] {
				name,
				"rangers": *[_type == 'ranger' && rangerInfo.team._ref == ^._id] | order(rangerInfo.order asc) {
					_id,
					name,
					rangerInfo {
						...,
						'color': color.title,
						'slug': slug.current,
						'team': team->name,
						'teamPosition': teamPosition.current
					},
					rangerCards {
						...,
						'image': image.asset->url,
					}
				}
			}[0]`;

			const data = await sanity.fetch(query);

			setTeam(data?.name || '');
			setRangers(data?.rangers || []);

			setTimeout(() => setLoadingState(false), 500);
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

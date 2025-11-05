import { getColor } from '../../utils/helpers';
import './RangerCard.css';

export default function RangerCard({ ranger, noDesc = false, single = false, className = '' }) {
	const rangerColor = ranger?.rangerInfo?.color || '';
	const teamPosition = ranger?.rangerInfo?.teamPosition || '';
	
	// Format team position text
	const formatTeamPosition = (position) => {
		if (!position) return '';
		return position[0] === '*' 
			? position.replace(/\*/g, '') 
			: `${position.replace(/-/g, '')} Ranger`;
	};

	// Build custom classes
	const getCustomClasses = () => {
		const classes = [];
		
		if (single) classes.push('single');
		if (!ranger?.rangerCards?.image) classes.push('custom-height');
		
		classes.push(getColor(rangerColor));
		
		return classes.join(' ');
	};

	return (
		<div className={`w-full overflow-hidden border card ${single ? 'sm:flex' : 'md:flex'} ${className}`}>
			<div className={`ranger__image ${getCustomClasses()}`}>
				{ranger?.rangerCards?.image && (
					<img
						className="p-4 rounded-full max-h-48"
						src={`${ranger.rangerCards.image}?h=${single ? '200' : '125'}`}
						alt={ranger.name}
					/>
				)}
			</div>

			<div
				className={`flex flex-col justify-between w-full leading-normal bg-white content ${
					single ? 'sm:p-2' : 'md:p-4'
				}`}
			>
				<span>
					<p className="items-center font-bold text-gray-900 uppercase text-md">
						{ranger?.name}
					</p>
					<p className="flex items-center text-sm text-gray-600">
						{formatTeamPosition(teamPosition)}
					</p>
					<div className="mb-2 text-xl font-bold text-gray-900">
						{ranger?.rangerCards?.abilityName}
					</div>
					{!noDesc && (
						<p className="text-base text-gray-700">
							{ranger?.rangerCards?.abilityDesc}
						</p>
					)}
				</span>
			</div>
		</div>
	);
}

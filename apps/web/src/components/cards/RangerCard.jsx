import { useEffect, useRef, useState } from 'react';
import { Shield, Sword, Zap } from 'lucide-react';
import './RangerCard.css';

const rangerColors = {
	red: '#E53E3E',
	blue: '#0080FF',
	green: '#38A169',
	yellow: '#FFC000',
	pink: '#D53F8C',
	black: '#2D3748',
	white: '#F7FAFC',
	orange: '#FF8C00',
	purple: '#6B21A8',
	gold: '#B8860B',
	silver: '#A0AEC0',
	shadow: '#4A9AB0',
	dark: '#392C77',
};

const DiceIcon = ({ size = 14, color = '#374151' }) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		fill="none"
		stroke={color}
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
	>
		<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
		<path d="M3.3 7l8.7 5 8.7-5" />
		<path d="M12 22V12" />
	</svg>
);

const CardCutOutShape = ({ color, subColor }) => {
	const top = -20;
	const bottom = 40;

	return (
		<svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 300 30">
			{subColor && (
				<rect x="0" y="26" width="300" height="5" fill={subColor} />
			)}
			{/* Left triangle */}
			{subColor && (
				<path
					d={`M0 0 H${top + 9} L${bottom + 9} 30 H0 Z`}
					fill={subColor}
				/>
			)}
			<path
				d={`M0 0 H${top} L${bottom} 30 H0 Z`}
				fill={color}
			/>
			{/* Right triangle */}
			{subColor && (
				<path
					d={`M${291 - top} 0 H300 V30 H${291 - bottom} Z`}
					fill={subColor}
				/>
			)}
			<path
				d={`M${300 - top} 0 H300 V30 H${300 - bottom} Z`}
				fill={color}
			/>
		</svg>
	);
};

export default function RangerCard({ ranger, card, onPress, noWrapper, parentScale }) {
	const wrapperRef = useRef(null);
	const [scale, setScale] = useState(1);

	useEffect(() => {
		if (!wrapperRef.current || noWrapper) return;
		
		const updateScale = () => {
			const wrapperWidth = wrapperRef.current.offsetWidth;
			const baseWidth = 150;
			const newScale = wrapperWidth / baseWidth;
			setScale(newScale);
		};
		
		updateScale();
		window.addEventListener('resize', updateScale);
		return () => window.removeEventListener('resize', updateScale);
	}, [noWrapper]);

	// If card data is provided directly (for deck cards)
	if (card) {
		const textColor = card.color === 'white' ? 'black' : 'white';
		const mainColor = rangerColors[card.color?.toLowerCase()] || rangerColors.red;
		const subColor = card.subColor ? rangerColors[card.subColor.toLowerCase()] : null;

		const cardContent = (
		<div 
			className="ranger-card-container" 
			onClick={onPress}
			style={noWrapper ? {
				transform: `scale(${parentScale || 1})`,
				transformOrigin: 'top left'
			} : {
				transform: `translate(-50%, -50%) scale(${scale})`
			}}
		>
				{/* Header */}
				<div className="ranger-card-header">
					<div className="ranger-card-cutout" style={{ bottom: -1 }}>
						<CardCutOutShape color={mainColor} subColor={subColor} />
					</div>
					<div className="ranger-card-title">{card.name}</div>
				</div>

				{/* Type Banner */}
				<div className="ranger-card-type-banner" style={{ backgroundColor: mainColor }}>
					<div className="ranger-card-stat-container" style={{ position: 'absolute', left: '0.5rem' }}>
						<Zap size={10} color={textColor} strokeWidth={2.5} />
						<span className="ranger-card-stat-text" style={{ color: textColor }}>
							{card.energy >= 0 ? card.energy : 'X'}
						</span>
					</div>
					<span className="ranger-card-type-text" style={{ color: textColor }}>
						{card.type}
					</span>
				</div>

				{/* Main Content */}
				<div className="ranger-card-content">
					<div className="ranger-card-cutout" style={{ top: -1, transform: 'rotate(180deg)' }}>
						<CardCutOutShape color={mainColor} subColor={subColor} />
					</div>
					
					{card.type === 'attack' && card.attack && card.attack.map((attack, idx) => (
						<div key={idx}>
							{attack.fixed ? (
								<div className="ranger-card-fixed-attack">
									<Sword size={14} strokeWidth={2.5} color="black" />
									<span className="ranger-card-stat-text" style={{ color: 'black', fontSize: 12, fontWeight: 'bold' }}>
										{attack.value}
									</span>
								</div>
							) : (
								<div className="ranger-card-dice-container">
									{attack.value < 0 ? (
										<span style={{ color: subColor || mainColor, fontWeight: 'bold', fontSize: '12px' }}>Special</span>
									) : (
										[...Array(attack.value)].map((_, index) => (
											<DiceIcon
												key={index}
												size={16}
												color={subColor || mainColor}
											/>
										))
									)}
								</div>
							)}
						</div>
					))}

					<div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
						{card.text && card.text.map((text, idx) => (
							<p key={idx} className="ranger-card-description" style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
						))}
					</div>
					
					<div className="ranger-card-cutout" style={{ bottom: -2 }}>
						<CardCutOutShape color={mainColor} subColor={subColor} />
					</div>
				</div>

				{/* Footer */}
				<div className="ranger-card-footer" style={{ backgroundColor: mainColor }}>
					<span className="ranger-card-footer-text" style={{ color: textColor }}>
						{card.cardTitle || (card.team && card.color ? `${card.team} ${card.color}` : '')}
					</span>
					<div className="ranger-card-stat-container">
						<Shield size={10} color={textColor} strokeWidth={2.5} />
						<span className="ranger-card-stat-text" style={{ color: textColor }}>
							{card.shields}
						</span>
					</div>
				</div>
			</div>
		);

		if (noWrapper) {
			return cardContent;
		}

		return (
			<div className="ranger-card-wrapper" ref={wrapperRef}>
				{cardContent}
			</div>
		);
	}

	// Legacy ranger display card (for ranger profile pages)
	const rangerColor = ranger?.rangerInfo?.color || '';
	const cardTitle = ranger?.rangerInfo?.cardTitle;
	const title = ranger?.rangerInfo?.title;
	const name = ranger?.name;
	const teamName = ranger?.rangerInfo?.team || '';
	
	const getDisplayName = () => cardTitle || name;
	const getDisplayTitle = () => {
		if (title) return title;
		const color = rangerColor.charAt(0).toUpperCase() + rangerColor.slice(1);
		return `${teamName} ${color} Ranger`;
	};

		return (
			<div className="w-full overflow-hidden border card sm:flex">
				<div className="ranger__image" style={{ backgroundColor: rangerColors[rangerColor?.toLowerCase()] || '#ccc' }}>
					{ranger?.rangerCards?.image && (
						<div
							style={{
								width: '12rem',
								height: '12rem',
								overflow: 'hidden',
								backgroundImage: `url('${ranger.rangerCards.image}?h=200')`,
								backgroundSize: 'cover',
								backgroundPosition: 'center top',
								backgroundRepeat: 'no-repeat',
							}}
						/>
					)}
				</div>
			<div className="flex flex-col justify-between w-full leading-normal bg-white content sm:p-2">
				<span>
					<p className="items-center font-bold text-gray-900 uppercase text-md">
						{getDisplayName()}
					</p>
					<p className="flex items-center text-sm text-gray-600">
						{getDisplayTitle()}
					</p>
					<div className="mb-2 text-xl font-bold text-gray-900">
						{ranger?.rangerCards?.abilityName}
					</div>
					<p className="text-base text-gray-700">
						{ranger?.rangerCards?.abilityDesc}
					</p>
				</span>
			</div>
		</div>
	);
}

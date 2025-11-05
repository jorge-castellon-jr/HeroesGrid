import { useState, useMemo } from 'react';
import Counter from '../components/Counter';

export default function Countdown() {
	const [selectedOpen, setSelectedOpen] = useState(false);
	const [selectedDifficulty, setSelectedDifficulty] = useState('Normal');
	const [enemyCount, setEnemyCount] = useState(1);

	const difficulties = ['Easy', 'Normal', 'Hard'];

	const difficultySelected = (difficulty) => {
		setSelectedDifficulty(difficulty);
		setSelectedOpen(false);
	};

	const timeBasedOnDifficulty = useMemo(() => {
		const min = 60000;
		switch (selectedDifficulty) {
			case 'Easy':
				return min * 1.25 * enemyCount;
			case 'Hard':
				return min * 0.75 * enemyCount;
			default:
				return min * enemyCount;
		}
	}, [selectedDifficulty, enemyCount]);

	return (
		<div className="max-w-md px-4 mx-auto">
			<div className="mb-8">
				<h1>Countdown</h1>
			</div>
			
			<div className="flex items-center justify-between mb-6">
				<div className="flex-1 font-semibold">Select Difficulty</div>
				<div className="relative flex-1">
					<button
						onClick={() => setSelectedOpen(!selectedOpen)}
						className="w-full p-3 py-2 text-left bg-white border border-gray-400 rounded-lg shadow-lg cursor-pointer hover:bg-gray-300"
					>
						{selectedDifficulty}
					</button>
					<div
						className={`absolute w-full mt-2 overflow-hidden transition-opacity duration-300 bg-white border border-gray-400 rounded-lg shadow-lg cursor-pointer z-10 ${
							selectedOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
						}`}
					>
						{difficulties.map((difficulty) => (
							<div
								key={difficulty}
								className="p-3 hover:bg-gray-200"
								onClick={() => difficultySelected(difficulty)}
							>
								{difficulty}
							</div>
						))}
					</div>
				</div>
			</div>
			
			<div className="flex flex-col space-between">
				<div className="mb-4 font-semibold">How Many Enemies</div>
				<div className="flex flex-wrap justify-between">
					{[...Array(8)].map((_, i) => {
						const enemy = i + 1;
						return (
							<div key={enemy} className="w-1/4 my-4">
								<button
									className={`px-8 py-10 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg hover:bg-gray-300 ${
										enemy <= enemyCount
											? enemy <= 4
												? 'bg-gray-400'
												: 'bg-yellow-200'
											: ''
									}`}
									onClick={() => setEnemyCount(enemy)}
								>
									{enemy}
								</button>
							</div>
						);
					})}
				</div>
			</div>
			
			<Counter startTime={timeBasedOnDifficulty} />
		</div>
	);
}

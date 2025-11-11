import { useState } from 'react';
import Die from '../components/gameComponents/Die';
import { random } from '../utils/helpers';

export default function Dice() {
	const [dieCount, setDieCount] = useState(0);
	const [rolledDice, setRolledDice] = useState([]);
	const [rerolled, setRerolled] = useState(0);
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const rollDice = () => {
		if (error) setError(false);
		
		if (!dieCount) {
			setError(true);
			setErrorMessage('Choose an amount of Dice to roll');
			return;
		}

		if (rolledDice.length > 0) {
			setRerolled(rerolled + 1);
		}

		const newRolls = [];
		for (let i = 0; i < dieCount; i++) {
			const roll = random(1, 7);
			newRolls.push(roll);
		}
		setRolledDice(newRolls);
	};

	const reset = () => {
		setRolledDice([]);
		setDieCount(0);
		setRerolled(0);
		setError(false);
	};

	return (
		<div className="max-w-md px-4 mx-auto">
			<h1>Dice Roller</h1>
			<h2 className="mb-6">How many dice?</h2>
			<div className="flex flex-wrap justify-center">
				{[...Array(12)].map((_, i) => {
					const die = i + 1;
					return (
						<div key={`option-${die}`} className="flex justify-center w-1/4 my-2">
							<button
								className={`self-center transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-14 h-14 md:w-20 md:h-20 hover:bg-gray-300 ${
									die <= dieCount
										? die >= 9
											? 'bg-red-400'
											: die <= 4
											? 'bg-gray-400'
											: 'bg-yellow-200'
										: ''
								}`}
								onClick={() => setDieCount(die)}
							>
								{die}
							</button>
						</div>
					);
				})}
			</div>

			<div className="flex flex-col">
				<button
					className="p-4 mx-auto mt-6 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
					onClick={rollDice}
				>
					{rolledDice.length ? 'Reroll Dice' : 'Roll Dice'}
				</button>
				<button
					className="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
					onClick={reset}
				>
					Reset
				</button>
				{error && <p className="text-center text-red-500">{errorMessage}</p>}
			</div>

			{rolledDice.length > 0 && (
				<div>
					<h2 className="mb-6">
						Rolled Dice
						{rerolled > 1 && <span> x {rerolled}</span>}
					</h2>
					<div className="flex flex-wrap justify-center">
						{rolledDice.map((die, i) => (
							<div key={`rolled-${i}`} className="flex justify-center w-1/4 my-2">
								<Die number={die} />
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

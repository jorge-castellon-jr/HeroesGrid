import { useState } from 'react';
import './Tokens.css';

export default function Tokens() {
	const [energyCount, setEnergyCount] = useState(3);
	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	const minus = () => {
		if (energyCount === 0) {
			setError(true);
			setErrorMessage('Energy cannot go below 0');
			return;
		}

		setError(false);
		setEnergyCount(energyCount - 1);
	};

	const add = () => {
		setError(false);
		setEnergyCount(energyCount + 1);
	};

	const reset = () => {
		setEnergyCount(3);
		setError(false);
	};

	return (
		<div className="max-w-md px-4 mx-auto">
			<h2 className="mb-6">Token Tracker</h2>
			<div className="flex items-center justify-center mb-6">
				<div>
					<button className="button" onClick={minus}>
						-
					</button>
				</div>
				<div className="relative flex items-center justify-center w-32 h-32 mx-6">
					<div className="count">{energyCount}</div>
					<div className="bg"></div>
				</div>
				<div>
					<button className="button" onClick={add}>
						+
					</button>
				</div>
			</div>
			<div className="flex flex-col">
				<button
					className="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
					onClick={reset}
				>
					Reset
				</button>
				{error && <p className="text-center text-red-500">{errorMessage}</p>}
			</div>
		</div>
	);
}

export default function Die({ number = 1 }) {
	const getSymbol = () => {
		const num = typeof number === 'string' ? parseInt(number) : number;
		
		if (num === 1 || num === 6) return 'O';
		if (num === 2 || num === 4 || num === 5) return 'X';
		if (num === 3) return 'X X';
		
		return 'O';
	};

	return (
		<div className="flex items-center justify-center border border-gray-400 rounded-lg shadow-lg w-14 h-14 md:w-20 md:h-20">
			{getSymbol()}
		</div>
	);
}

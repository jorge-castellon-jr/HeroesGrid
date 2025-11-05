export default function EnemyCard({ enemy, type = 'foot soldier' }) {
	const getEnemyColor = () => {
		switch (type.toLowerCase()) {
			case 'monster':
				return 'bg-orange-400';
			case 'master':
				return 'bg-pink-800';
			default:
				return 'bg-lime-300';
		}
	};

	return (
		<div className="w-full overflow-hidden border card lg:flex">
			<div className={`lg:h-auto lg:w-48 flex-none ${getEnemyColor()}`}>
				{enemy?.image && (
					<img
						className="p-4 mx-auto max-h-48 md:full"
						src={`${enemy.image}?h=150`}
						alt={enemy.name}
					/>
				)}
			</div>

			<div className="flex flex-col justify-between w-full leading-normal bg-white content md:p-4">
				<span>
					<p className="items-center font-bold text-gray-900 uppercase text-md">
						{enemy?.name}
					</p>
				</span>
			</div>
		</div>
	);
}

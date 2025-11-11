import { useState } from 'react';

export default function NavBar() {
	const [quickOpen, setQuickOpen] = useState(false);
	
	const menu = [
		{
			title: 'Rangers',
			to: '#rangersTeam',
		},
		{
			title: 'Teams',
			to: '#allTeams',
		},
	];

	return (
		<nav className="fixed top-0 right-0 flex justify-end w-full">
			<div
				className={`relative h-16 px-6 py-4 m-4 overflow-hidden bg-white rounded-full shadow-md ${
					quickOpen ? 'w-full' : 'w-48'
				}`}
			>
				<div className="absolute inset-0 flex items-center justify-start flex-grow-0 max-w-lg">
					<span
						className="px-4 text-sm text-gray-700 cursor-pointer"
						onClick={() => setQuickOpen(!quickOpen)}
					>
						Quick Links
					</span>
					{menu.map((link) => (
						<a
							key={link.to}
							className="px-4 ml-2 font-bold text-gray-800 hover:text-blue-dark"
							href={link.to}
						>
							{link.title}
						</a>
					))}
				</div>
			</div>
		</nav>
	);
}

import { useState, useEffect } from 'react';
import EnemyCard from '../components/cards/EnemyCard';
import './Enemies.css';

export default function Enemies() {
	const [footSoldiers, setFootSoldiers] = useState([]);
	const [monsters, setMonsters] = useState([]);
	const [bosses, setBosses] = useState([]);

	useEffect(() => {
		// TODO: Fetch enemies from WatermelonDB when data is available
		const fetchEnemies = async () => {
			// Placeholder for now
			setFootSoldiers([]);
			setMonsters([]);
			setBosses([]);
		};

		fetchEnemies();
	}, []);

	return (
		<div className="max-w-3xl mx-auto">
			<h1>Enemies</h1>
			
			<h2>All Foot Soldiers</h2>
			<ul className="enemies">
				{footSoldiers.map((soldier, i) => (
					<li
						key={i}
						className={`enemies__unit ${
							i % 2 === 0 ? 'enemies__unit--left' : 'enemies__unit--right'
						}`}
					>
						<EnemyCard enemy={soldier} type="foot soldier" />
					</li>
				))}
			</ul>

			<h2>All Monsters</h2>
			<ul className="enemies">
				{monsters.map((monster, i) => (
					<li
						key={i}
						className={`enemies__unit ${
							i % 2 === 0 ? 'enemies__unit--left' : 'enemies__unit--right'
						}`}
					>
						<EnemyCard enemy={monster} type="monster" />
					</li>
				))}
			</ul>

			<h2>All Bosses</h2>
			<ul className="enemies">
				{bosses.map((boss, i) => (
					<li
						key={i}
						className={`enemies__unit ${
							i % 2 === 0 ? 'enemies__unit--left' : 'enemies__unit--right'
						}`}
					>
						<EnemyCard enemy={boss} type="master" />
					</li>
				))}
			</ul>
		</div>
	);
}

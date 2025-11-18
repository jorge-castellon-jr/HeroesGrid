import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import EnemyCard from '../components/cards/EnemyCard';
import Die from '../components/gameComponents/Die';
import { database } from '../database';
import { Q } from '@nozbe/watermelondb';
import { random } from '../utils/helpers';
import '../styles/Randomizer.css';
import './GameTools.css';

export default function GameTools() {
	const { setLoadingState } = useApp();
	const [activeTab, setActiveTab] = useState('randomizer');

	// ========== RANDOMIZER STATE ==========
	const [randomizerTab, setRandomizerTab] = useState('rangers');
	const [rangers, setRangers] = useState([]);
	const [footSoldiers, setFootSoldiers] = useState([]);
	const [monsters, setMonsters] = useState([]);
	const [masters, setMasters] = useState([]);
	const [rangerExpansions, setRangerExpansions] = useState([]);
	const [enemyExpansions, setEnemyExpansions] = useState([]);
	const [rangerCheckedOptions, setRangerCheckedOptions] = useState([]);
	const [enemyCheckedOptions, setEnemyCheckedOptions] = useState([]);
	const [chosenRangers, setChosenRangers] = useState([]);
	const [chosenFootSoldiers, setChosenFootSoldiers] = useState([]);
	const [chosenMonsters, setChosenMonsters] = useState([]);
	const [chosenMasters, setChosenMasters] = useState([]);
	const [randomizerError, setRandomizerError] = useState(false);
	const [randomizerErrorMessage, setRandomizerErrorMessage] = useState('');

	// ========== DICE STATE ==========
	const [dieCount, setDieCount] = useState(0);
	const [rolledDice, setRolledDice] = useState([]);
	const [rerolled, setRerolled] = useState(0);
	const [diceError, setDiceError] = useState(false);
	const [diceErrorMessage, setDiceErrorMessage] = useState('');

	// ========== TOKEN STATE ==========
	const [energyCount, setEnergyCount] = useState(3);
	const [tokenError, setTokenError] = useState(false);
	const [tokenErrorMessage, setTokenErrorMessage] = useState('');

	// Fetch data for Randomizer
	useEffect(() => {
		const fetchData = async () => {
			try {
				const rangersCollection = database.get('rangers');
				const enemiesCollection = database.get('enemies');
				const expansionsCollection = database.get('expansions');
				
				const fetchedRangers = await rangersCollection.query(Q.where('published', true)).fetch();
				const fetchedEnemies = await enemiesCollection.query().fetch();
				const fetchedExpansions = await expansionsCollection.query().fetch();
				
				const transformedRangers = await Promise.all(
					fetchedRangers.map(async (r) => {
						const team = await r.team.fetch();
						return {
							_id: r.id,
							name: r.name,
							rangerInfo: {
								slug: r.slug,
								team: team?.name || '',
								color: r.color,
								teamPosition: r.teamPosition,
								expansion: r.expansionId,
								cardTitle: r.cardTitle,
								title: r.title
							},
							rangerCards: {
								image: r.imageUrl,
								abilityName: r.abilityName,
								abilityDesc: r.abilityDesc
							}
						}
					})
				);
				
				const transformEnemy = (e) => ({
					_id: e.id,
					name: e.name,
					slug: e.slug,
					expansion: e.expansionId,
					image: null
				});
				
			const footSoldiersData = fetchedEnemies
				.filter(e => ['foot', 'elite'].includes(e.monsterType?.toLowerCase()))
				.map(transformEnemy);
			
			const monstersData = fetchedEnemies
				.filter(e => ['monster', 'nemesis'].includes(e.monsterType?.toLowerCase()))
				.map(transformEnemy);
			
			const mastersData = fetchedEnemies
				.filter(e => e.monsterType?.toLowerCase() === 'boss')
				.map(transformEnemy);
				
				const transformedExpansions = fetchedExpansions.map(e => ({
					_id: e.id,
					name: e.name,
					image: e.imageUrl
				}));
				
				setRangers(transformedRangers);
				setFootSoldiers(footSoldiersData);
				setMonsters(monstersData);
				setMasters(mastersData);
				setRangerExpansions(transformedExpansions);
				setEnemyExpansions(transformedExpansions);
				
				setTimeout(() => setLoadingState(false), 500);
			} catch (error) {
				console.error('Error fetching data:', error);
				setLoadingState(false);
			}
		};

		fetchData();
	}, [setLoadingState]);

	// ========== RANDOMIZER COMPUTED VALUES ==========
	const filteredRangers = useMemo(() => {
		return rangers.filter((r) =>
			rangerCheckedOptions.find((o) => o === r.rangerInfo.expansion)
		);
	}, [rangers, rangerCheckedOptions]);

	const filteredFootSoldiers = useMemo(() => {
		return footSoldiers.filter((e) =>
			enemyCheckedOptions.find((o) => o === e.expansion)
		);
	}, [footSoldiers, enemyCheckedOptions]);

	const filteredMonsters = useMemo(() => {
		return monsters.filter((e) =>
			enemyCheckedOptions.find((o) => o === e.expansion)
		);
	}, [monsters, enemyCheckedOptions]);

	const filteredMasters = useMemo(() => {
		return masters.filter((e) =>
			enemyCheckedOptions.find((o) => o === e.expansion)
		);
	}, [masters, enemyCheckedOptions]);

	// ========== RANDOMIZER METHODS ==========
	const setAllOptions = (text) => {
		const expansions = text === 'rangers' ? rangerExpansions : enemyExpansions;
		const allIds = expansions.map((e) => e._id);
		if (text === 'rangers') {
			setRangerCheckedOptions(allIds);
		} else {
			setEnemyCheckedOptions(allIds);
		}
	};

	const toggleOption = (id, type) => {
		if (type === 'ranger') {
			setRangerCheckedOptions((prev) =>
				prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
			);
		} else {
			setEnemyCheckedOptions((prev) =>
				prev.includes(id) ? prev.filter((o) => o !== id) : [...prev, id]
			);
		}
	};

	const pick = (filtered, chosen, setChosen, limit) => {
		if (randomizerError) setRandomizerError(false);
		if (chosen.length >= limit) {
			setRandomizerError(true);
			setRandomizerErrorMessage('Limit Reached');
			return;
		}
		if (!filtered.length) {
			setRandomizerError(true);
			setRandomizerErrorMessage('Please Choose Option');
			return;
		}

		const availableItems = filtered.filter((item) => 
			!chosen.find((c) => c._id === item._id)
		);

		if (!availableItems.length) {
			setRandomizerError(true);
			setRandomizerErrorMessage('All available items already chosen');
			return;
		}

		const randomIdx = Math.floor(Math.random() * availableItems.length);
		const picked = availableItems[randomIdx];
		setChosen([...chosen, picked]);
	};

	const pickRanger = () => {
		pick(filteredRangers, chosenRangers, setChosenRangers, 6);
	};

	const pickFootSoldier = () => {
		pick(filteredFootSoldiers, chosenFootSoldiers, setChosenFootSoldiers, 2);
	};

	const pickMonster = () => {
		pick(filteredMonsters, chosenMonsters, setChosenMonsters, 2);
	};

	const pickMaster = () => {
		pick(filteredMasters, chosenMasters, setChosenMasters, 1);
	};

	const resetRandomizer = (type) => {
		switch (type) {
			case 'rangers':
				setChosenRangers([]);
				setRangerCheckedOptions([]);
				break;
			default:
				setEnemyCheckedOptions([]);
				setChosenFootSoldiers([]);
				setChosenMonsters([]);
				setChosenMasters([]);
				break;
		}
		setRandomizerError(false);
	};

	const switchRandomizerTab = (tab) => {
		setRandomizerTab(tab);
		setRandomizerError(false);
	};

	// ========== DICE METHODS ==========
	const rollDice = () => {
		if (diceError) setDiceError(false);
		
		if (!dieCount) {
			setDiceError(true);
			setDiceErrorMessage('Choose an amount of Dice to roll');
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

	const resetDice = () => {
		setRolledDice([]);
		setDieCount(0);
		setRerolled(0);
		setDiceError(false);
	};

	// ========== TOKEN METHODS ==========
	const minusToken = () => {
		if (energyCount === 0) {
			setTokenError(true);
			setTokenErrorMessage('Energy cannot go below 0');
			return;
		}

		setTokenError(false);
		setEnergyCount(energyCount - 1);
	};

	const addToken = () => {
		setTokenError(false);
		setEnergyCount(energyCount + 1);
	};

	const resetToken = () => {
		setEnergyCount(3);
		setTokenError(false);
	};

	return (
		<div className="game-tools-container">
			<div className="game-tools-content">
				{/* RANDOMIZER TAB */}
				{activeTab === 'randomizer' && (
					<div className="max-w-screen-lg mx-auto">
						<h1>Randomizer</h1>

						<div className="flex justify-end px-4 -mx-4 overflow-hidden border-b">
							<button
								className={`tab ${randomizerTab === 'rangers' ? 'tab--open' : ''}`}
								onClick={() => switchRandomizerTab('rangers')}
							>
								Rangers
							</button>
							<button
								className={`tab ${randomizerTab === 'enemies' ? 'tab--open' : ''}`}
								onClick={() => switchRandomizerTab('enemies')}
							>
								Enemies
							</button>
						</div>

						{randomizerTab === 'rangers' && (
							<div key="rangers">
								<h2>Rangers</h2>
								<p>Choose Expansion(s):</p>
								<div className="flex flex-wrap justify-center -mx-3 md:mx-auto">
									<div className="flex w-full p-2">
										<button
											className="w-full p-3 text-center card"
											onClick={() => setAllOptions('rangers')}
										>
											All Expansions
										</button>
									</div>
									{rangerExpansions.map((option) => (
										<div
											key={option._id}
											className="flex w-1/2 p-2 md:w-1/3 lg:w-1/4"
										>
											<input
												type="checkbox"
												id={option._id}
												value={option._id}
												checked={rangerCheckedOptions.includes(option._id)}
												onChange={() => toggleOption(option._id, 'ranger')}
												className="hidden"
											/>
											<label
												htmlFor={option._id}
												className="flex flex-col items-center justify-center w-full p-3 text-center transition-colors duration-300 border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:bg-gray-200 checkbox"
											>
												<img
													className="w-2/5"
													src={`${option.image}?h=100`}
													alt={option.name}
												/>
												{option.name}
											</label>
										</div>
									))}
								</div>
								<div className="flex flex-col">
									<button
										className="p-4 mx-auto mt-6 transition-colors duration-300 card w-72 hover:bg-gray-300"
										onClick={pickRanger}
									>
										Pick a Random Ranger
									</button>
									<button
										className="p-4 mx-auto my-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
										onClick={() => resetRandomizer('rangers')}
									>
										Reset
									</button>
									{randomizerError && <p className="text-center text-red-500">{randomizerErrorMessage}</p>}
								</div>
								<div className="flex flex-wrap">
									{chosenRangers.map((ranger) => (
										<div
											key={ranger._id}
											className="flex py-3 md:py-6 md:w-1/2 md:p-4"
										>
											<RangerCard ranger={ranger} sanity />
										</div>
									))}
								</div>
							</div>
						)}

						{randomizerTab === 'enemies' && (
							<div key="enemies">
								<h2>Enemies</h2>
								<p>Choose Expansion(s):</p>
								<div className="flex flex-wrap justify-center -mx-3 md:mx-auto">
									<div className="flex w-full p-2">
										<button
											className="w-full p-3 text-center card"
											onClick={() => setAllOptions('enemies')}
										>
											All Expansions
										</button>
									</div>
									{enemyExpansions.map((option) => (
										<div
											key={option._id}
											className="flex w-1/2 p-2 md:w-1/3 lg:w-1/4"
										>
											<input
												type="checkbox"
												id={option._id}
												value={option._id}
												checked={enemyCheckedOptions.includes(option._id)}
												onChange={() => toggleOption(option._id, 'enemy')}
												className="hidden"
											/>
											<label
												htmlFor={option._id}
												className="flex flex-col items-center justify-center w-full p-3 text-center transition-colors duration-300 border border-gray-200 rounded-lg shadow-lg cursor-pointer hover:bg-gray-200 checkbox"
											>
												<img
													className="w-2/5"
													src={`${option.image}?h=100`}
													alt={option.name}
												/>
												{option.name}
											</label>
										</div>
									))}
								</div>
								<div className="flex flex-col">
									<button
										className="p-4 mx-auto mt-6 transition-colors duration-300 card w-72 hover:bg-gray-300"
										onClick={pickFootSoldier}
									>
										Random Foot Soldier
									</button>
									<button
										className="flex flex-col p-4 mx-auto mt-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
										onClick={pickMonster}
									>
										Random Monster
										<span className="text-xs text-gray-400">
											This includes Nemesis As Monsters
										</span>
									</button>
									<button
										className="flex flex-col p-4 mx-auto mt-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
										onClick={pickMaster}
									>
										Random Master
									<span className="text-xs text-gray-400">
										Bosses only
									</span>
									</button>
									<button
										className="p-4 mx-auto my-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
										onClick={() => resetRandomizer('enemy')}
									>
										Reset
									</button>
									{randomizerError && <p className="text-center text-red-500">{randomizerErrorMessage}</p>}
								</div>

								{chosenFootSoldiers.length > 0 && (
									<div>
										<h3>Foot Soldiers</h3>
										<div className="flex flex-wrap -mx-2">
											{chosenFootSoldiers.map((footSoldier) => (
												<div
													key={footSoldier._id}
													className="flex w-1/2 p-2 py-3 md:py-6"
												>
													<EnemyCard enemy={footSoldier} type="foot soldier" />
												</div>
											))}
										</div>
									</div>
								)}

								{chosenMonsters.length > 0 && (
									<div>
										<h3>Monsters</h3>
										<div className="flex flex-wrap -mx-2">
											{chosenMonsters.map((monster) => (
												<div
													key={monster._id}
													className="flex w-1/2 p-2 py-3 md:py-6"
												>
													<EnemyCard enemy={monster} type="monster" />
												</div>
											))}
										</div>
									</div>
								)}

								{chosenMasters.length > 0 && (
									<div>
										<h3>Master</h3>
										<div className="flex flex-wrap justify-center">
											{chosenMasters.map((master) => (
												<div key={master._id} className="flex w-full py-3 md:py-6">
													<EnemyCard enemy={master} type="master" />
												</div>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</div>
				)}

				{/* DICE TAB */}
				{activeTab === 'dice' && (
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
								onClick={resetDice}
							>
								Reset
							</button>
							{diceError && <p className="text-center text-red-500">{diceErrorMessage}</p>}
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
				)}

				{/* TOKEN TAB */}
				{activeTab === 'tokens' && (
					<div className="max-w-md px-4 mx-auto">
						<h2 className="mb-6">Token Tracker</h2>
						<div className="flex items-center justify-center mb-6">
							<div>
								<button className="button" onClick={minusToken}>
									-
								</button>
							</div>
							<div className="relative flex items-center justify-center w-32 h-32 mx-6">
								<div className="count">{energyCount}</div>
								<div className="bg"></div>
							</div>
							<div>
								<button className="button" onClick={addToken}>
									+
								</button>
							</div>
						</div>
						<div className="flex flex-col">
							<button
								className="p-4 mx-auto my-4 transition-colors duration-300 border border-gray-400 rounded-lg shadow-lg w-72 hover:bg-gray-300"
								onClick={resetToken}
							>
								Reset
							</button>
							{tokenError && <p className="text-center text-red-500">{tokenErrorMessage}</p>}
						</div>
					</div>
				)}
			</div>

			{/* TAB NAVIGATION - STICKY AT BOTTOM */}
			<div className="game-tools-tabs">
				<button
					className={`game-tools-tab ${activeTab === 'randomizer' ? 'active' : ''}`}
					onClick={() => setActiveTab('randomizer')}
				>
					<span className="text-sm font-medium">Randomizer</span>
				</button>
				<button
					className={`game-tools-tab ${activeTab === 'dice' ? 'active' : ''}`}
					onClick={() => setActiveTab('dice')}
				>
					<span className="text-sm font-medium">Dice Roller</span>
				</button>
				<button
					className={`game-tools-tab ${activeTab === 'tokens' ? 'active' : ''}`}
					onClick={() => setActiveTab('tokens')}
				>
					<span className="text-sm font-medium">Token Tracker</span>
				</button>
			</div>
		</div>
	);
}

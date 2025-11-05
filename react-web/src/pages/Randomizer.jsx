import { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import RangerCard from '../components/cards/RangerCard';
import EnemyCard from '../components/cards/EnemyCard';
import sanity from '../lib/sanityClient';
import '../styles/Randomizer.css';

export default function Randomizer() {
	const { setLoadingState } = useApp();
	const [tabSelection, setTabSelection] = useState('rangers');

	// Data from Sanity
	const [rangers, setRangers] = useState([]);
	const [footSoldiers, setFootSoldiers] = useState([]);
	const [monsters, setMonsters] = useState([]);
	const [masters, setMasters] = useState([]);

	const [rangerExpansions, setRangerExpansions] = useState([]);
	const [enemyExpansions, setEnemyExpansions] = useState([]);

	// Checked options
	const [rangerCheckedOptions, setRangerCheckedOptions] = useState([]);
	const [enemyCheckedOptions, setEnemyCheckedOptions] = useState([]);

	// Chosen results
	const [chosenRangers, setChosenRangers] = useState([]);
	const [chosenFootSoldiers, setChosenFootSoldiers] = useState([]);
	const [chosenMonsters, setChosenMonsters] = useState([]);
	const [chosenMasters, setChosenMasters] = useState([]);

	const [error, setError] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');

	// Fetch data from Sanity
	useEffect(() => {
		const fetchData = async () => {
			const query = `{
				"rangers": *[_type == "ranger"] {
					_id,
					name,
					slug,
					rangerInfo {
						...,
						'color': color.title,
						'slug': slug.current,
						'team': team->name,
						'teamPosition': teamPosition.current,
						"expansion": expansion._ref
					},
					rangerCards {
						...,
						'image': image.asset->url
					},
					"imageLarge": rangerInfo.image.asset->url
				},
				"footSoldiers": *[_type == "footsoldier"] {
					...,
					"expansion": expansion._ref,
					"image": image.asset->url
				},
				"monsters": *[_type == "monster"] {
					...,
					"expansion": expansion._ref,
					"image": image.asset->url
				},
				"masters": *[_type == "master"] {
					...,
					"expansion": expansion._ref,
					"image": image.asset->url
				},
				"rangerExpansions": *[_type == "expansion"] | order(name asc) {
					_id,
					name,
					"image": image.asset->url
				},
				"enemyExpansions": *[_type == "expansion"] | order(name asc) {
					_id,
					name,
					"image": image.asset->url
				}
			}`;

			const data = await sanity.fetch(query);

			setRangers(data.rangers || []);
			setFootSoldiers(data.footSoldiers || []);
			setMonsters(data.monsters || []);
			setMasters(data.masters || []);
			setRangerExpansions(data.rangerExpansions || []);
			setEnemyExpansions(data.enemyExpansions || []);

			console.log('Rangers:', data.rangers?.slice(0, 2));
			console.log('Expansions:', data.rangerExpansions);

			setTimeout(() => setLoadingState(false), 500);
		};

		fetchData();
	}, []);

	// Computed filtered arrays
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

	// Methods
	const setAllOptions = (text) => {
		const expansions =
			text === 'rangers' ? rangerExpansions : enemyExpansions;
		const chosen =
			text === 'rangers' ? rangerCheckedOptions : enemyCheckedOptions;

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
		if (error) setError(false);
		if (chosen.length >= limit) {
			setError(true);
			setErrorMessage('Limit Reached');
			return;
		}
		if (!filtered.length) {
			setError(true);
			setErrorMessage('Please Choose Option');
			return;
		}

		// Filter out already chosen items
		const availableItems = filtered.filter((item) => 
			!chosen.find((c) => c._id === item._id)
		);

		if (!availableItems.length) {
			setError(true);
			setErrorMessage('All available items already chosen');
			return;
		}

		const random = Math.floor(Math.random() * availableItems.length);
		const picked = availableItems[random];
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

	const reset = (type) => {
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
		setError(false);
	};

	const switchTab = (tab) => {
		setTabSelection(tab);
		setError(false);
	};

	return (
		<div className="max-w-screen-lg mx-auto">
			<h1>Randomizer</h1>

			<div className="flex justify-end px-4 -mx-4 overflow-hidden border-b">
				<button
					className={`tab ${tabSelection === 'rangers' ? 'tab--open' : ''}`}
					onClick={() => switchTab('rangers')}
				>
					Rangers
				</button>
				<button
					className={`tab ${tabSelection === 'enemies' ? 'tab--open' : ''}`}
					onClick={() => switchTab('enemies')}
				>
					Enemies
				</button>
			</div>

			{tabSelection === 'rangers' && (
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
							onClick={() => reset('rangers')}
						>
							Reset
						</button>
						{error && <p className="text-center text-red-500">{errorMessage}</p>}
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

			{tabSelection === 'enemies' && (
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
								This includes Nemesis As Masters
							</span>
						</button>
						<button
							className="p-4 mx-auto my-4 transition-colors duration-300 card w-72 hover:bg-gray-300"
							onClick={() => reset('enemy')}
						>
							Reset
						</button>
						{error && <p className="text-center text-red-500">{errorMessage}</p>}
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
	);
}

import { createContext, useContext, useReducer } from 'react'

const AppContext = createContext()

const initialState = {
	rangers: [],
	teams: [],
	footSoldiers: [],
	monsters: [],
	bosses: [],
	initLoad: false,
	loading: true,
}

const reducer = (state, action) => {
	switch (action.type) {
		case 'SET_RANGERS':
			return { ...state, rangers: action.payload }
		case 'SET_TEAMS':
			return { ...state, teams: action.payload }
		case 'SET_FOOT_SOLDIERS':
			return { ...state, footSoldiers: action.payload }
		case 'SET_MONSTERS':
			return { ...state, monsters: action.payload }
		case 'SET_BOSSES':
			return { ...state, bosses: action.payload }
		case 'SET_INIT_LOAD':
			return { ...state, initLoad: action.payload }
		case 'SET_LOADING_STATE':
			return { ...state, loading: action.payload }
		default:
			return state
	}
}

export const AppProvider = ({ children }) => {
	const [state, dispatch] = useReducer(reducer, initialState)

	const getRangers = async () => {
		if (state.rangers.length === 0) {
			// This would use Nuxt Content in original, keeping structure for now
			// const rangers = await fetch content
			// dispatch({ type: 'SET_RANGERS', payload: rangers })
		}
	}

	const getTeams = async () => {
		if (state.teams.length === 0) {
			// This would use Nuxt Content in original
			// const rangers = await fetch content
			// Filter unique teams
			// dispatch({ type: 'SET_TEAMS', payload: teams })
		}
	}

	const getFootSoldiers = async () => {
		if (state.footSoldiers.length === 0) {
			// This would use Nuxt Content in original
			// const footSoldiers = await fetch content
			// dispatch({ type: 'SET_FOOT_SOLDIERS', payload: footSoldiers })
		}
	}

	const getMonsters = async () => {
		if (state.monsters.length === 0) {
			// This would use Nuxt Content in original
			// const monsters = await fetch content
			// dispatch({ type: 'SET_MONSTERS', payload: monsters })
		}
	}

	const getBosses = async () => {
		if (state.bosses.length === 0) {
			// This would use Nuxt Content in original
			// const bosses = await fetch content
			// dispatch({ type: 'SET_BOSSES', payload: bosses })
		}
	}

	const getEverything = () => {
		getRangers()
		getTeams()
		getFootSoldiers()
		getMonsters()
		getBosses()
		dispatch({ type: 'SET_INIT_LOAD', payload: true })
	}

	const setLoadingState = (bool) => {
		dispatch({ type: 'SET_LOADING_STATE', payload: bool })
	}

	const getCurrentRanger = (slug) => {
		return state.rangers.find(ranger => ranger.slug === slug)
	}

	const getSimilarRangers = (currentRanger) => {
		return state.rangers.filter(
			ranger =>
				ranger.color === currentRanger.color &&
				ranger.team === currentRanger.team
		)
	}

	const value = {
		state,
		dispatch,
		getRangers,
		getTeams,
		getFootSoldiers,
		getMonsters,
		getBosses,
		getEverything,
		setLoadingState,
		getCurrentRanger,
		getSimilarRangers,
	}

	return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => {
	const context = useContext(AppContext)
	if (!context) {
		throw new Error('useApp must be used within AppProvider')
	}
	return context
}

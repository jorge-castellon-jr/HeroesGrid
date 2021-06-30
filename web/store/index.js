export const state = () => ({
	rangers: [],
	teams: [],
	footSoldiers: [],
	monsters: [],
	bosses: [],
	initLoad: false,
	loading: true,
})

export const mutations = {
	setRangers(state, rangers) {
		state.rangers = rangers
	},
	setTeams(state, teams) {
		state.teams = teams
	},
	setFootSoldiers(state, footSoldiers) {
		state.footSoldiers = footSoldiers
	},
	setMonsters(state, monsters) {
		state.monsters = monsters
	},
	setBosses(state, bosses) {
		state.bosses = bosses
	},
	setInitLoad(state, bool) {
		state.initLoad = bool
	},
	setLoadingState(state, bool) {
		state.loading = bool
	},
}

export const getters = {
	getRangers(state) {
		return state.rangers
	},
	getCurrentRanger: state => slug => {
		return state.rangers.find(ranger => ranger.slug === slug)
	},
	getSimilarRangers: state => currentRanger => {
		return state.rangers.filter(
			ranger =>
				ranger.color === currentRanger.color &&
				ranger.team === currentRanger.team,
		)
	},
	getTeams(state) {
		return state.teams
	},
	getFootSoldiers(state) {
		return state.footSoldiers
	},
	getMonsters(state) {
		return state.monsters
	},
	getBosses(state) {
		return state.bosses
	},
	getLoadingState(state) {
		return state.loading
	},
}
export const actions = {
	async getRangers({ commit, state }) {
		const rangers = await this.$content("rangers").fetch(),
			old = state.rangers

		if (old.length == 0) commit("setRangers", rangers)
	},
	async getTeams({ commit, state }) {
		const rangers = await this.$content("rangers").only(["team"]).fetch(),
			old = state.teams

		let teams = rangers.filter(
			(ranger, i, self) => i === self.findIndex(t => t.team === ranger.team),
		)

		if (old.length == 0) commit("setTeams", teams)
	},
	async getFootSoldiers({ commit, state }) {
		const footSoldiers = await this.$content("foot-soldiers").fetch(),
			old = state.footSoldiers

		if (old.length == 0) commit("setFootSoldiers", footSoldiers)
	},
	async getMonsters({ commit, state }) {
		const monsters = await this.$content("monsters").fetch(),
			old = state.monsters

		if (old.length == 0) commit("setMonsters", monsters)
	},
	async getBosses({ commit, state }) {
		const bosses = await this.$content("bosses").fetch(),
			old = state.bosses

		if (old.length == 0) commit("setBosses", bosses)
	},
	getEverything({ commit, dispatch }) {
		dispatch("getRangers")
		dispatch("getTeams")
		dispatch("getFootSoldiers")
		dispatch("getMonsters")
		dispatch("getBosses")

		commit("setInitLoad", true)
	},
}

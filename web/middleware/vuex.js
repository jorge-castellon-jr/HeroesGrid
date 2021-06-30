export default ({ store, route }) => {
	if (!store.state.initLoad) store.dispatch("getEverything")
}

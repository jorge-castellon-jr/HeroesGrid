export default ({ app }) => {
	// Every time the route changes (fired on initialization too)
	app.router.beforeEach((to, from, next) => {
		console.log("Change route")
		app.store.commit("setLoadingState", true)
		next()
	})
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/layout/Layout'
import SyncLoader from './components/SyncLoader'
import Home from './pages/Home'
import AllRangers from './pages/AllRangers'
import AllTeams from './pages/AllTeams'
import Dice from './pages/Dice'
import Tokens from './pages/Tokens'
import Rulebooks from './pages/Rulebooks'
import RulebookSingle from './pages/RulebookSingle'
import Countdown from './pages/Countdown'
import Randomizer from './pages/Randomizer'
import Team from './pages/Team'
import Ranger from './pages/Ranger'
import Admin from './pages/Admin'
import './App.css'

function App() {
	return (
		<AppProvider>
			<SyncLoader />
			<Router>
				<Layout>
					<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/all-rangers" element={<AllRangers />} />
					<Route path="/all-teams" element={<AllTeams />} />
					<Route path="/dice" element={<Dice />} />
					<Route path="/tokens" element={<Tokens />} />
					<Route path="/countdown" element={<Countdown />} />
					<Route path="/randomizer" element={<Randomizer />} />
					<Route path="/rulebooks" element={<Rulebooks />} />
					<Route path="/rulebooks/:slug" element={<RulebookSingle />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/:team" element={<Team />} />
					<Route path="/:team/:ranger" element={<Ranger />} />
					</Routes>
				</Layout>
			</Router>
		</AppProvider>
	)
}

export default App

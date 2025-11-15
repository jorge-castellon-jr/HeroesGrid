import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { DialogProvider } from './contexts/DialogContext'
import { Toaster } from '@/components/ui/sonner'
import Layout from './components/layout/Layout'
import SyncLoader from './components/SyncLoader'
import Home from './pages/Home'
import AllRangers from './pages/AllRangers'
import AllTeams from './pages/AllTeams'
import GameTools from './pages/GameTools'
import Rulebooks from './pages/Rulebooks'
import RulebookSingle from './pages/RulebookSingle'
import Countdown from './pages/Countdown'
import Team from './pages/Team'
import Ranger from './pages/Ranger'
import Admin from './pages/Admin'
import Settings from './pages/Settings'
import CreateCustomRanger from './pages/CreateCustomRanger'
import MyRangers from './pages/MyRangers'
import CustomRangerDetail from './pages/CustomRangerDetail'
import PrintToPlay from './pages/PrintToPlay'
import './App.css'

function App() {
	return (
		<AppProvider>
			<DialogProvider>
				<Toaster />
				<SyncLoader />
				<Router>
				<Layout>
					<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/all-rangers" element={<AllRangers />} />
					<Route path="/all-teams" element={<AllTeams />} />
					<Route path="/game-tools" element={<GameTools />} />
					<Route path="/countdown" element={<Countdown />} />
					<Route path="/rulebooks" element={<Rulebooks />} />
					<Route path="/rulebooks/:slug" element={<RulebookSingle />} />
					<Route path="/admin" element={<Admin />} />
					<Route path="/settings" element={<Settings />} />
					<Route path="/rangers/create" element={<CreateCustomRanger />} />
					<Route path="/my-rangers" element={<MyRangers />} />
					<Route path="/my-rangers/:slug" element={<CustomRangerDetail />} />
					<Route path="/print-to-play" element={<PrintToPlay />} />
					<Route path="/:team" element={<Team />} />
					<Route path="/:team/:ranger" element={<Ranger />} />
					</Routes>
					</Layout>
				</Router>
			</DialogProvider>
		</AppProvider>
	)
}

export default App

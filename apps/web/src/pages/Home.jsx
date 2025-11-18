import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import Logo from '../components/layout/Logo'
import CommunitySection from '../components/CommunitySection'

const Home = () => {
	const { setLoadingState } = useApp()

	useEffect(() => {
		const timer = setTimeout(() => setLoadingState(false), 500)
		return () => clearTimeout(timer)
	}, [setLoadingState])

	return (
		<div className="container max-w-4xl p-4 mx-auto">
			<div className="text-center">
				<h1 className="-mx-4">#1 Companion app for</h1>
				<Logo />
				{/* Content would go here - in Nuxt this used nuxt-content */}
				<div className="content-placeholder mt-2">
					<p>Welcome to Heroes Grid - the ultimate companion app for Heroes of the Grid!</p>
				</div>
			</div>

			<CommunitySection />
		</div>
	)
}

export default Home

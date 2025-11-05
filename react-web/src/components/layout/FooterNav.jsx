import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PRIcons from '../PRIcons'
import database from '../../database'
import './FooterNav.scss'

const FooterNav = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()

	const menu = [
		{
			title: "Home",
			to: "/",
			icon: "home",
			nuxt: true,
		},
		{
			title: "Rulebooks",
			to: "/rulebooks",
			icon: "rules",
			nuxt: true,
		},
		{
			title: "All Rangers",
			to: "/all-rangers",
			icon: "morpher",
			nuxt: true,
		},
		{
			title: "Randomizer",
			to: "/randomizer",
			icon: "pr-hotg",
			nuxt: true,
		},
		{
			title: "Dice Roller",
			to: "/dice",
			icon: "pr-hotg",
			nuxt: true,
		},
		{
			title: "Token Tracker",
			to: "/tokens",
			icon: "pr-hotg",
			nuxt: true,
		},
	]

	const nuxtLinks = menu.filter(item => item.nuxt)
	const version = import.meta.env.VITE_VERSION_NUMBER || "1.3.2"

	const handleResetDatabase = async () => {
		try {
			await database.write(async () => {
				await database.unsafeResetDatabase();
			});
			window.location.reload();
		} catch (error) {
			console.error('Error resetting database:', error);
		}
	}

	return (
		<div>
			<nav className="nav desktop">
				<div className="flex flex-wrap flex-1 md:flex-col md:w-full">
					{nuxtLinks.map(link => (
						<Link 
							key={link.to} 
							to={link.to} 
							className={`nav__link ${location.pathname === link.to ? 'active' : ''}`}
						>
							<PRIcons icon={link.icon} />
							<span className="pt-2 text-sm capitalize">{link.title}</span>
						</Link>
					))}
				</div>
				<button 
					onClick={handleResetDatabase}
					className="px-4 py-2 mb-4 text-xs text-white bg-red-600 rounded hover:bg-red-700"
				>
					Reset Database
				</button>
				<span className="absolute bottom-0 left-0 px-4 py-6 text-sm text-gray-300">v{version}</span>
			</nav>
			<a onClick={() => setMenuOpen(!menuOpen)} className={`nav__link ${menuOpen ? 'open' : ''}`} id="home-link">
				<PRIcons />
				<span className="hidden text-sm capitalize md:block">Menu</span>
			</a>
			{menuOpen && (
				<div className={`nav__transition ${menuOpen ? 'nav__transition--enter' : 'nav__transition--leave'}`}>
					<nav
						className={`nav mobile ${menuOpen ? 'open' : 'closed'}`}
						onClick={() => setMenuOpen(false)}
					>
						<div className="flex flex-wrap flex-1 md:flex-col md:w-full">
							{nuxtLinks.map(link => (
								<Link 
									key={link.to} 
									to={link.to} 
									className={`nav__link ${location.pathname === link.to ? 'active' : ''}`}
								>
									<PRIcons icon={link.icon} />
									<span className="pt-2 text-sm capitalize">{link.title}</span>
								</Link>
							))}
						</div>
						<button 
							onClick={handleResetDatabase}
							className="px-4 py-2 mb-4 text-xs text-white bg-red-600 rounded hover:bg-red-700"
						>
							Reset Database
						</button>
						<span className="absolute bottom-0 left-0 px-4 py-6 text-sm text-gray-300">v{version}</span>
					</nav>
				</div>
			)}
		</div>
	)
}

export default FooterNav

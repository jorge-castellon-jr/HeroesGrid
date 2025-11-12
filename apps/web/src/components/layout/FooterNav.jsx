import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PRIcons from '../PRIcons'
import { isAdminMode } from '../../utils/adminMode'
import './FooterNav.scss'

const FooterNav = () => {
	const [menuOpen, setMenuOpen] = useState(false)
	const location = useLocation()

	const adminEnabled = isAdminMode()

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
			title: "My Rangers",
			to: "/my-rangers",
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
		...(adminEnabled ? [{
			title: "Admin",
			to: "/admin",
			icon: "pr-hotg",
			nuxt: true,
		}] : []),
	];

	const nuxtLinks = menu.filter(item => item.nuxt)

	return (
		<div>
			<nav className="nav desktop dark:bg-gray-900 dark:border-purple-600">
				<div className="flex flex-wrap flex-1 md:flex-col md:w-full">
					{nuxtLinks.map(link => (
						<Link 
							key={link.to} 
							to={link.to} 
							className={`nav__link dark:hover:bg-gray-800 ${location.pathname === link.to ? 'active dark:bg-gray-800 dark:text-purple-400' : ''}`}
						>
							<PRIcons icon={link.icon} />
							<span className="pt-2 text-sm capitalize">{link.title}</span>
						</Link>
					))}
				</div>
				<div className="flex flex-col gap-2 items-center mb-4">
					<Link 
						to="/settings" 
						className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
					>
						Settings
					</Link>
				</div>
			</nav>
			<a onClick={() => setMenuOpen(!menuOpen)} className={`nav__link dark:bg-gray-800 dark:border-purple-600 ${menuOpen ? 'open' : ''}`} id="home-link">
				<PRIcons />
				<span className="hidden text-sm capitalize md:block">Menu</span>
			</a>
			{menuOpen && (
				<div className={`nav__transition ${menuOpen ? 'nav__transition--enter' : 'nav__transition--leave'}`}>
					<nav
						className={`nav mobile dark:bg-gray-900 dark:border-purple-600 ${menuOpen ? 'open' : 'closed'}`}
						onClick={() => setMenuOpen(false)}
					>
						<div className="flex flex-wrap flex-1 md:flex-col md:w-full">
							{nuxtLinks.map(link => (
								<Link 
									key={link.to} 
									to={link.to} 
									className={`nav__link dark:hover:bg-gray-800 ${location.pathname === link.to ? 'active dark:bg-gray-800 dark:text-purple-400' : ''}`}
								>
									<PRIcons icon={link.icon} />
									<span className="pt-2 text-sm capitalize">{link.title}</span>
								</Link>
							))}
						</div>
						<div className="flex flex-col gap-2 items-center mb-4">
							<Link 
								to="/settings" 
								className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
							>
								Settings
							</Link>
						</div>
					</nav>
				</div>
			)}
		</div>
	)
}

export default FooterNav

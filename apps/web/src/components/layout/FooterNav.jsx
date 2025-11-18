import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import PRIcons from '../PRIcons'
import AuthButton from '../AuthButton'
import NotificationBadge from '../notifications/NotificationBadge'
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
			title: "Community",
			to: "/community",
			icon: "pr-hotg",
			nuxt: true,
		},
		{
			title: "Companion",
			to: "/game-tools",
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
				<div className="flex flex-col gap-2 items-center mb-4">
					<NotificationBadge />
					<AuthButton />
					<Link 
						to="/settings" 
						className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
					>
						Settings
					</Link>
				</div>
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
						<div className="flex flex-col gap-2 items-center mb-4">
							<NotificationBadge />
							<AuthButton />
							<Link 
								to="/settings" 
								className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded hover:bg-secondary/80"
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

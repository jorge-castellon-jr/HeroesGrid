import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { Switch } from '@/components/ui/switch'

const DarkModeToggle = () => {
	const { state, toggleDarkMode } = useApp()
	const { darkMode } = state

	return (
		<div className="flex items-center gap-2">
			<Sun size={16} className="text-muted-foreground" />
			<Switch
				checked={darkMode}
				onCheckedChange={toggleDarkMode}
				aria-label="Toggle dark mode"
			/>
			<Moon size={16} className="text-muted-foreground" />
		</div>
	)
}

export default DarkModeToggle

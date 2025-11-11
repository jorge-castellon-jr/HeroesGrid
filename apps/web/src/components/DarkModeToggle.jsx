import { Moon, Sun } from 'lucide-react'
import { useApp } from '../context/AppContext'

const DarkModeToggle = () => {
	const { state, toggleDarkMode } = useApp()
	const { darkMode } = state

	return (
		<button
			onClick={toggleDarkMode}
			className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
			aria-label="Toggle dark mode"
		>
			{darkMode ? <Sun size={20} /> : <Moon size={20} />}
		</button>
	)
}

export default DarkModeToggle

import { useApp } from '../context/AppContext'

const SyncLoader = () => {
	const { state } = useApp()
	const { loading, syncProgress } = state

	if (!loading) return null

	const getMessage = () => {
		if (!syncProgress) return 'Initializing...'
		
		switch (syncProgress.stage) {
			case 'checking':
				return 'Checking for updates...'
			case 'clearing':
				return 'Clearing old data...'
			case 'downloading':
				return 'Downloading new data...'
			case 'images':
				return 'Loading images...'
			case 'complete':
				return 'Almost ready...'
			case 'error':
				return `Error: ${syncProgress.message}`
			default:
				return syncProgress.message || 'Loading...'
		}
	}

	return (
		<div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
			<div className="text-center">
				<div className="mb-4">
					<div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
				</div>
				<h2 className="text-2xl font-bold text-white mb-2">Heroes Grid</h2>
				<p className="text-gray-300">{getMessage()}</p>
				{syncProgress?.stage === 'error' && (
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Retry
					</button>
				)}
			</div>
		</div>
	)
}

export default SyncLoader

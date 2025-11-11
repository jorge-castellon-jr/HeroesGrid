import { useState, useEffect } from 'react'
import { getSyncStatus, forceSync, getLocalVersion } from '../services/syncService'

const SyncManager = () => {
	const [status, setStatus] = useState(null)
	const [syncing, setSyncing] = useState(false)
	const [progress, setProgress] = useState(null)
	const [error, setError] = useState(null)
	const [lastSync, setLastSync] = useState(null)

	useEffect(() => {
		loadStatus()
	}, [])

	const loadStatus = async () => {
		try {
			const syncStatus = await getSyncStatus()
			setStatus(syncStatus)
			
			const localVer = getLocalVersion()
			setLastSync(localVer)
		} catch (err) {
			setError(err.message)
		}
	}

	const handleForceSync = async () => {
		try {
			setSyncing(true)
			setError(null)
			setProgress({ stage: 'starting', message: 'Starting sync...' })

			const result = await forceSync((prog) => {
				setProgress(prog)
			})

			console.log('Sync result:', result)
			await loadStatus()
			setProgress({ stage: 'complete', message: 'Sync complete!' })
			
			// Reload page after 2 seconds
			setTimeout(() => {
				window.location.reload()
			}, 2000)
		} catch (err) {
			setError(err.message)
			setProgress(null)
		} finally {
			setSyncing(false)
		}
	}

	const clearCache = async () => {
		try {
			// Clear localStorage
			localStorage.removeItem('heroes_grid_version')
			
			// Clear IndexedDB (WatermelonDB)
			if (window.indexedDB) {
				await window.indexedDB.deleteDatabase('heroesGrid')
			}
			
			// Clear service worker caches
			if ('caches' in window) {
				const cacheNames = await caches.keys()
				await Promise.all(cacheNames.map(name => caches.delete(name)))
			}
			
			window.location.reload()
		} catch (err) {
			setError('Error clearing cache: ' + err.message)
		}
	}

	return (
		<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
				Data Sync Manager
			</h2>

			{/* Status Display */}
			<div className="space-y-4 mb-6">
				<div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
					<h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
						Version Info
					</h3>
					<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
						<div className="flex justify-between">
							<span>Local Version:</span>
							<span className="font-mono">
								{status?.localVersion || 'Not synced'}
							</span>
						</div>
						<div className="flex justify-between">
							<span>Remote Version:</span>
							<span className="font-mono">
								{status?.remoteVersion || 'Loading...'}
							</span>
						</div>
						<div className="flex justify-between">
							<span>Status:</span>
							<span className={`font-semibold ${
								status?.needsUpdate 
									? 'text-orange-500' 
									: 'text-green-500'
							}`}>
								{status?.needsUpdate ? 'Update Available' : 'Up to Date'}
							</span>
						</div>
						{lastSync?.lastUpdated && (
							<div className="flex justify-between">
								<span>Last Synced:</span>
								<span className="text-xs">
									{new Date(lastSync.lastUpdated).toLocaleString()}
								</span>
							</div>
						)}
					</div>
				</div>

				{/* Progress Display */}
				{progress && (
					<div className="bg-blue-50 dark:bg-blue-900 p-4 rounded">
						<div className="flex items-center space-x-2">
							{progress.stage !== 'complete' && (
								<div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
							)}
							<span className="text-sm text-blue-900 dark:text-blue-100">
								{progress.message}
							</span>
						</div>
					</div>
				)}

				{/* Error Display */}
				{error && (
					<div className="bg-red-50 dark:bg-red-900 p-4 rounded">
						<p className="text-sm text-red-900 dark:text-red-100">
							Error: {error}
						</p>
					</div>
				)}
			</div>

			{/* Actions */}
			<div className="flex flex-wrap gap-3">
				<button
					onClick={handleForceSync}
					disabled={syncing}
					className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
				>
					{syncing ? 'Syncing...' : 'Force Sync'}
				</button>
				
				<button
					onClick={loadStatus}
					disabled={syncing}
					className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:bg-gray-400 transition"
				>
					Refresh Status
				</button>

				<button
					onClick={clearCache}
					disabled={syncing}
					className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 transition"
				>
					Clear All Cache
				</button>
			</div>

			{/* Info */}
			<div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
				<p className="mb-2">
					<strong>Auto-sync:</strong> The app automatically checks for updates on each load.
				</p>
				<p>
					<strong>Force Sync:</strong> Downloads all data and images regardless of version.
				</p>
			</div>
		</div>
	)
}

export default SyncManager

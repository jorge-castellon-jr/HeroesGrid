import DarkModeToggle from '../components/DarkModeToggle';

export default function Settings() {
  const version = __APP_VERSION__;

  const handleClearCache = async () => {
    if (!confirm('Are you sure you want to clear the cache? This will reload the page.')) {
      return;
    }
    
    try {
      // Clear service worker cache
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      alert('Cache cleared successfully. The page will now reload.');
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing cache:', error);
      alert('Error clearing cache: ' + error.message);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your preferences and app settings</p>
      </div>

      {/* Appearance Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Appearance</h2>
        
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium dark:text-gray-200">Theme</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Choose between light and dark mode
            </p>
          </div>
          <DarkModeToggle />
        </div>
      </div>

      {/* Cache Management Section */}
      <div className="mb-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Cache Management</h2>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            If you're experiencing issues with the app, try clearing the cache. This will remove all cached data and reload the application.
          </p>
          
          <button
            onClick={handleClearCache}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">About</h2>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version</span>
            <span className="font-mono dark:text-white">{version}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Storage</span>
            <span className="dark:text-white">WatermelonDB</span>
          </div>
        </div>
      </div>
    </div>
  );
}

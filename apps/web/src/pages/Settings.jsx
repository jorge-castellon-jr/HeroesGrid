import DarkModeToggle from '../components/DarkModeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Settings() {
  const version = __APP_VERSION__;

  const handleClearCache = async () => {
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
      
      window.location.reload(true);
    } catch (error) {
      console.error('Error clearing cache:', error);
      window.location.reload(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your preferences and app settings</p>
      </div>

      {/* Appearance Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium">Theme</label>
              <p className="text-xs text-muted-foreground mt-1">
                Choose between light and dark mode
              </p>
            </div>
            <DarkModeToggle />
          </div>
        </CardContent>
      </Card>

      {/* Cache Management Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cache Management</CardTitle>
          <CardDescription>
            If you're experiencing issues with the app, try clearing the cache. This will remove all cached data and reload the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleClearCache}
            variant="destructive"
          >
            Clear Cache
          </Button>
        </CardContent>
      </Card>

      {/* About Section */}
      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-mono">{version}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Storage</span>
              <span>WatermelonDB</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

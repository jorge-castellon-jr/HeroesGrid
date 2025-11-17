# PWA Sync System Documentation

## Overview

Heroes Grid now features a Progressive Web App (PWA) implementation with automatic data synchronization. The app downloads all data and images on first load and caches them for offline use. When you update the data version, users will automatically receive the new content on their next visit.

## How It Works

### 1. Version Management

The system uses a version file at `/public/data/version.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-09T19:00:00Z",
  "description": "Data version for Heroes Grid"
}
```

### 2. Automatic Sync on Load

When the app loads:
1. Checks the remote version against the local version stored in localStorage
2. If versions don't match (or no local version exists), triggers a full sync
3. Downloads and seeds all data from `/data/export/*.json` files
4. Preloads all ranger images
5. Stores the new version in localStorage

### 3. Service Worker Caching

The Vite PWA plugin automatically:
- Caches all static assets (JS, CSS, HTML, images)
- Caches JSON data files
- Enables offline functionality
- Updates when new versions are deployed

## Updating Content

### To Deploy New Content:

1. Update your data files in `/data/export/*.json`
2. Add/update images in `/public/uploads/`
3. **Increment the version in `/public/data/version.json`**:
   ```json
   {
     "version": "1.1.0",
     "lastUpdated": "2025-01-10T14:30:00Z",
     "description": "Added new ranger cards"
   }
   ```
4. Build and deploy: `yarn build`

When users visit the app, they'll automatically download the new data.

## Admin Tools

Visit `/admin` and add the `<SyncManager />` component to access sync controls:

- **View current version status** - See local vs remote versions
- **Force Sync** - Manually trigger a full data download
- **Clear Cache** - Remove all cached data and reset the app

## Components

### Core Files

- **`src/services/syncService.js`** - Main sync logic
- **`src/components/SyncLoader.jsx`** - Loading screen during sync
- **`src/components/SyncManager.jsx`** - Admin UI for managing sync
- **`vite.config.js`** - PWA configuration
- **`public/data/version.json`** - Version tracking

## Testing

### Test Initial Load
1. Clear all browser data
2. Open app - should show "Downloading new data..."
3. Verify data loads correctly

### Test Version Update
1. Increment version in `version.json`
2. Reload app - should re-sync automatically

### Test Offline Mode
1. Load app and sync data
2. Disconnect internet
3. App should work fully offline

## Troubleshooting

### Data not updating?
- Check `version.json` is updated and deployed
- Clear cache and reload
- Check console for errors

### Clear everything:
```javascript
// In browser console
localStorage.removeItem('heroes_grid_version')
indexedDB.deleteDatabase('heroesGrid')
location.reload()
```

# Testing Offline PWA Functionality

## Important: PWA Only Works After Initial Load

The service worker needs to cache assets on the **first visit**. Here's how to test:

## Method 1: Using Dev Server (Recommended for Testing)

With `devOptions.enabled: true` in vite.config.js, the service worker now works in dev mode:

```bash
yarn dev
```

1. **Open browser** to http://localhost:5173
2. **Open DevTools** (F12) → Application tab → Service Workers
3. **Verify service worker is registered** (should see "activated and running")
4. **Reload the page once** to let service worker cache everything
5. **Go offline**: 
   - DevTools → Network tab → Check "Offline"
   - OR disconnect your WiFi
6. **Reload the page** - it should work offline! ✅

## Method 2: Production Build

```bash
yarn build
yarn preview
```

1. Open http://localhost:4173
2. Wait for initial load (service worker installs)
3. Check DevTools → Application → Service Workers
4. Go offline and reload - should work!

## Method 3: Testing Cache Storage

In DevTools → Application:

### Check Service Worker
- Should see status: "activated and running"
- Should see scope: "/"

### Check Cache Storage
You should see these caches:
- `workbox-precache-v2-...` (your app files)
- `images-cache` (ranger images)
- `json-cache` (data files)

### Check IndexedDB
- `heroesGrid` database with all your game data

## Troubleshooting

### Service worker not registering?
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear site data: DevTools → Application → Clear storage → Clear site data
3. Restart dev server

### Still doesn't work offline?
1. Make sure you loaded the page **while online** first
2. Check that service worker is "activated and running"
3. Verify cache storage has entries
4. Check console for errors

### Testing in Incognito
Service workers work in incognito mode - good for testing fresh installs!

## What Gets Cached

✅ All static assets (JS, CSS, HTML)
✅ All JSON files in `/data/export/`
✅ All images in `/public/uploads/`
✅ Version file at `/public/data/version.json`
✅ Game data in IndexedDB (WatermelonDB)

## Note on Cache Updates

When you update the version:
- Service worker will detect new version
- Downloads updated files in background
- Updates on next page reload
- Old cache is cleared automatically

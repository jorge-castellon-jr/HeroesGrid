# PWA Sync System - Quick Start

## ✅ What's New

Your app now has:
- **Offline-first PWA** - Works without internet after first load
- **Automatic syncing** - Downloads all data and images on first visit
- **Version-based updates** - Users get new content automatically
- **Admin controls** - Manage sync from `/admin` page

## 🚀 How to Use

### For Development
```bash
yarn dev
```
Open the app - it will automatically sync on first load.

### For Production
```bash
yarn build
```
The `dist/` folder now includes:
- Service worker (`sw.js`)
- PWA manifest (`manifest.webmanifest`)
- All your cached assets

### Updating Content

1. Edit data in `/data/export/*.json`
2. Update `/public/data/version.json`:
   ```json
   {
     "version": "1.1.0",  // Increment this
     "lastUpdated": "2025-01-09T20:00:00Z",
     "description": "What changed"
   }
   ```
3. Build and deploy: `yarn build`

Users will auto-download updates on next visit!

## 🛠️ Admin Tools

Visit `/admin` to:
- Check current version
- Force manual sync
- Clear all cache

## 📦 What Gets Cached

✅ All static assets (JS, CSS, HTML)  
✅ All JSON data files  
✅ All ranger images (preloaded)  
✅ PWA works fully offline  

## 🔍 Testing

**Test first load:**
1. Clear browser data
2. Open app → should show loading screen
3. Data loads → app ready

**Test version update:**
1. Change version.json
2. Reload → automatically re-syncs

**Test offline:**
1. Load app once
2. Go offline
3. App still works! 🎉

## 📝 Files Created

- `src/services/syncService.js` - Sync logic
- `src/components/SyncLoader.jsx` - Loading screen
- `src/components/SyncManager.jsx` - Admin UI
- `public/data/version.json` - Version tracker
- `SYNC_SYSTEM.md` - Full documentation

## 💡 Tips

- Always increment version when updating data
- Check console for sync progress logs
- Service worker updates on app reload
- IndexedDB stores all game data locally

Enjoy your offline-first PWA! 🚀

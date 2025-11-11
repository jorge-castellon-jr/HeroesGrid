# Admin Mode Feature

## Overview

Admin mode adds powerful editing capabilities behind an environment flag, allowing you to edit rangers directly from their detail pages and access the admin panel.

## Enabling Admin Mode

Set the environment variable in `.env`:

```bash
VITE_ADMIN_MODE=true
```

## Features

### 1. Admin Link in Navigation

When admin mode is enabled, an "Admin" link appears in the navigation menu that takes you to `/admin`.

### 2. Edit Button on Ranger Pages

A floating edit button appears on ranger detail pages (bottom right) that opens a quick-edit modal.

### 3. Quick Edit Modal

The modal includes all ranger fields:
- Name, Title, Card Title Override
- Type (Core, Sixth, Extra, Ally)
- Color
- Team Position (with decimal support)
- Ability Name & Description
- Team & Expansion
- Image URL
- Checkboxes: Once Per Battle, Published

### 4. Real-Time Updates

Changes save immediately to the local database and the page refreshes automatically to show the updated data.

## Files

- `.env` - Set `VITE_ADMIN_MODE=true` here
- `src/utils/adminMode.js` - Utility to check if admin mode is enabled
- `src/components/RangerEditModal.jsx` - Edit modal component
- `src/components/layout/FooterNav.jsx` - Navigation with conditional admin link
- `src/pages/Ranger.jsx` - Ranger page with edit button and real-time updates

## Usage

### View Admin Panel
1. Enable admin mode in `.env`
2. Restart dev server: `yarn dev`
3. Click "Admin" in the navigation menu

### Edit a Ranger
1. Navigate to any ranger detail page (e.g., `/mighty-morphin/jason-lee-scott-leadership`)
2. Click the blue edit button (pencil icon) in the bottom right
3. Make your changes
4. Click "Save Changes"
5. The page automatically refreshes with your updates

## Disabling Admin Mode

Set in `.env`:

```bash
VITE_ADMIN_MODE=false
```

Or remove the line entirely. The edit button and admin link will disappear.

## Security Note

Admin mode is controlled by an environment variable that is baked into the build at compile time. For production:

- Set `VITE_ADMIN_MODE=false` before building
- Or use separate `.env` files for dev vs production

```bash
# For production build
VITE_ADMIN_MODE=false yarn build
```

## Development Workflow

1. Enable admin mode locally
2. Make edits through the UI
3. Export updated data from Admin panel
4. Commit changes to your JSON data files
5. Disable admin mode for production builds

# Phase 6 - Authentication Testing Guide

## Prerequisites

Before testing, ensure you have:

1. Discord OAuth credentials (client ID and secret)
2. Both API and web app running locally
3. Environment files configured correctly

## Setup Steps

### 1. Configure Environment Variables

#### API (.dev.vars)
Located at: `apps/api/.dev.vars`

```env
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_CLIENT_SECRET=your_client_secret_here
DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
SESSION_SECRET=513e66d5ea36da8e397e698b5bc0b06b30f0cb4ad515e7f5cea93d038a986a32
```

**Replace `your_client_id_here` and `your_client_secret_here` with your actual Discord OAuth credentials.**

#### Web App (.env.local)
Located at: `apps/web/.env.local`

```env
VITE_API_URL=http://localhost:8787/trpc
```

This should already be configured.

### 2. Start the API Server

```bash
cd apps/api
yarn dev
```

Expected output:
```
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### 3. Start the Web App

In a separate terminal:

```bash
cd apps/web
yarn dev
```

Expected output:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Testing Checklist

### Phase 1: Login Flow

- [ ] **Navigate to Settings page** (`http://localhost:5173/settings`)
- [ ] **Verify "Login with Discord" button is visible** in the Account section
- [ ] **Click "Login with Discord" button**
- [ ] **Verify redirect to Discord authorization page**
- [ ] **Authorize the application on Discord**
- [ ] **Verify redirect back to app** at `http://localhost:5173/` (home page)
- [ ] **Verify user avatar/username appears** in FooterNav (desktop) or Settings page
- [ ] **Check browser console** for any errors (should be none)
- [ ] **Check localStorage** for `auth_token` key (should exist and contain a UUID)

**Expected behavior:**
- Seamless redirect to Discord and back
- User info displayed immediately after auth
- No console errors
- Token stored in localStorage

### Phase 2: Authenticated State

- [ ] **Navigate to Settings page** again
- [ ] **Verify user info displayed** in Account section (avatar, username, email)
- [ ] **Verify "Logout" button visible** instead of "Login with Discord"
- [ ] **Click user avatar/name in FooterNav** (desktop sidebar)
- [ ] **Verify dropdown menu appears** with "View Profile" and "Logout" options
- [ ] **Click "View Profile"**
- [ ] **Verify Profile page loads** at `/profile`
- [ ] **Verify profile displays:**
  - User avatar (large)
  - Username
  - Email (if provided by Discord)
  - Discord ID

**Expected behavior:**
- All user info displays correctly
- Profile page accessible
- No layout issues or missing data

### Phase 3: Protected API Calls

- [ ] **Navigate to My Rangers page** (`/my-rangers`)
- [ ] **Verify page loads without errors**
- [ ] **Try to create a custom ranger**
  - Click "Create Custom Ranger" button
  - Fill in form fields
  - Submit the form
- [ ] **Verify ranger created successfully**
- [ ] **Check browser DevTools Network tab:**
  - Find tRPC mutation request
  - Verify `Authorization: Bearer <token>` header is present
  - Verify 200 OK response

**Expected behavior:**
- Custom ranger creation works
- API accepts requests with auth token
- No 401 Unauthorized errors

### Phase 4: Logout Flow

- [ ] **Click user avatar/name in FooterNav**
- [ ] **Select "Logout" from dropdown**
- [ ] **Verify redirect to home page** (or current page refreshes)
- [ ] **Verify "Login with Discord" button reappears** in Settings
- [ ] **Verify user info no longer displayed**
- [ ] **Check localStorage** - `auth_token` should be removed
- [ ] **Try to access Profile page** (`/profile`)
- [ ] **Verify redirect to Settings page** (requires auth)

**Expected behavior:**
- Clean logout with token removal
- UI updates to logged-out state
- Protected pages redirect appropriately

### Phase 5: Session Persistence

- [ ] **Login again using Discord**
- [ ] **Close the browser tab**
- [ ] **Open a new tab to `http://localhost:5173`**
- [ ] **Verify user is still logged in**
- [ ] **Navigate to different pages**
- [ ] **Verify auth state persists** across navigation

**Expected behavior:**
- Session persists across page reloads
- Token still valid from localStorage
- No need to re-authenticate

### Phase 6: Error Handling

#### Invalid Token
- [ ] **Open DevTools > Application > Local Storage**
- [ ] **Manually change `auth_token` to `invalid-token-123`**
- [ ] **Refresh the page**
- [ ] **Verify app detects invalid token and logs user out**

#### Network Errors
- [ ] **Stop the API server** (Ctrl+C in API terminal)
- [ ] **Try to login or access protected features**
- [ ] **Verify error handling:**
  - Toast notification or error message appears
  - App doesn't crash or hang
  - User can retry after API restarts

**Expected behavior:**
- Graceful error handling
- Clear error messages to user
- App remains functional

## Common Issues & Solutions

### Issue: "Failed to fetch" error

**Cause:** API server not running or CORS issue

**Solution:**
- Verify API is running at `http://localhost:8787`
- Check `apps/api/src/index.ts` CORS headers allow `http://localhost:5173`

### Issue: Discord redirects but no user info displayed

**Cause:** Token exchange failed or session not created

**Solution:**
- Check API console logs for errors during callback
- Verify Discord credentials in `.dev.vars` are correct
- Check D1 database for sessions table entries: `wrangler d1 execute heroes-grid-db --local --command "SELECT * FROM sessions"`

### Issue: "Invalid redirect_uri" from Discord

**Cause:** Redirect URI mismatch

**Solution:**
- Verify `.dev.vars` has `DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback`
- Verify Discord OAuth app has `http://localhost:5173/auth/callback` in allowed redirects
- Ensure exact match (including port number)

### Issue: API returns 401 Unauthorized for protected endpoints

**Cause:** Token not sent or invalid

**Solution:**
- Check browser DevTools Network tab for `Authorization` header in requests
- Verify token exists in localStorage
- Check API console for session validation errors
- Try logging out and back in

## Manual Database Inspection

### Check Sessions Table

```bash
cd apps/api
npx wrangler d1 execute heroes-grid-db --local --command "SELECT * FROM sessions"
```

Expected output: List of session records with valid tokens and expiry times

### Check Users Table

```bash
cd apps/api
npx wrangler d1 execute heroes-grid-db --local --command "SELECT * FROM users"
```

Expected output: Your Discord user record(s)

### Clear Sessions (if needed)

```bash
cd apps/api
npx wrangler d1 execute heroes-grid-db --local --command "DELETE FROM sessions"
```

## Success Criteria

Phase 6 is complete when:

- ✅ User can log in via Discord OAuth
- ✅ Session persists in localStorage across page reloads
- ✅ User info displays correctly in UI (avatar, username, email)
- ✅ Protected API endpoints require valid token
- ✅ Unauthorized requests return 401
- ✅ User can log out cleanly
- ✅ Profile page accessible and displays user info
- ✅ Custom rangers can be created with authenticated user
- ✅ No console errors during normal flow
- ✅ Graceful error handling for network/auth failures

## Next Steps

After successful testing:

1. Update `docs/in-progress/PHASE_6_AUTH_PROGRESS.md` with test results
2. Move to Phase 7: Cloud Sync & Deployment
3. Consider additional features:
   - User settings sync
   - Custom ranger sharing/likes
   - Public user profiles

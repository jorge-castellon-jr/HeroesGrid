# Roadmap Feature Implementation Summary

## Overview
Implemented a public roadmap page for the Tough Project website with Discord authentication, voting, and commenting capabilities.

## Key Features

### 1. Roadmap Page (`/roadmap`)
- **Default Landing Page**: Root URL (`/`) redirects to `/roadmap`
- **Three Status Sections**: "Planned", "In Progress", and "Completed"
- **Board View Toggle**: Switch between section-based layout and Trello-style board view
- **View Persistence**: Selected view stored in `localStorage`
- **Card Display**: Shows title, summary, status badge, upvote count, and comment coun
- **Clickable Cards**: Entire card (excluding action buttons) links to detail page

### 2. Roadmap Detail Page (`/roadmap/[id]`)
- **Rich Text Details**: WYSIWYG content from Payload's Lexical editor rendered with full formatting
- **Upvote Functionality**: Toggle upvote (one vote per user per item)
- **Comments Section**: View and post comments (login required)
- **Lazy Loading**: Comments load when `#comments` anchor is reached

### 3. Authentication System
- **Discord OAuth**: Users can login via Discord
- **Payload Auth Integration**: Discord users are created/updated in Payload Users collection
- **Account Types**: Three roles - `admin`, `editor`, `user`
- **Admin Panel Access**: Only `admin` and `editor` can access `/admin`
- **User Display**: Shows Discord username if available, falls back to email

### 4. Role-Based Access Control (RBAC)

#### User Roles
- **Admin**: Full access to all collections including Users
- **Editor**: Can access admin panel and manage all collections except Users
- **User**: Can only access public frontend, cannot access admin panel

#### Access Control Implementation
- **Payload Config**: `admin.access` restricts admin UI to editors/admins
- **Middleware**: Checks for auth cookie before allowing `/admin` access
- **Admin Page Component**: Server-side check redirects regular users away from admin

### 5. Collections

#### RoadmapItems (`roadmap-items`)
- Fields: `title`, `summary`, `details` (richText), `status`, `priority`, `upvoteCount`, `commentCount`
- Access: Public read, editor/admin create/update/delete

#### RoadmapVotes (`roadmap-votes`)
- Fields: `item` (relationship), `user` (relationship)
- Access: Authenticated users can create/delete their own votes
- Hooks: Enforces one vote per user per item, auto-updates `upvoteCount`

#### RoadmapComments (`roadmap-comments`)
- Fields: `item` (relationship), `user` (relationship), `body` (textarea)
- Access: Public read, authenticated users can create/update/delete their own
- Hooks: Auto-updates `commentCount` on related roadmap item

#### Users (`users`)
- Fields: `accountType`, `discordId`, `discordUsername`, `discordAvatar`
- Access: Only admins can manage users
- Hidden: Users collection hidden from non-admin users in admin UI

### 6. Technical Implementation Details

#### Database
- **SQLite (D1)**: Using `@payloadcms/db-d1-sqlite` adapter
- **Numeric IDs**: SQLite uses numeric IDs, code handles both string and number types
- **Relationship Handling**: `getRelId` helper handles numeric/string relationship values

#### Payload Client Caching
- **Global Cache**: `getPayloadClient()` prevents multiple Payload instances in development
- **Fixes**: Resolves "MaxListenersExceededWarning" memory leak issues

#### API Routes
- `/api/auth/discord`: Initiates Discord OAuth flow
- `/api/auth/discord/callback`: Handles OAuth callback, creates/updates user, sets auth cookie
- `/api/auth/logout`: Clears auth cookies
- `/api/roadmap/[id]/upvote`: Toggle upvote (POST)
- `/api/roadmap/[id]/comments`: Get comments (GET) or post comment (POST)

#### Cookie Management
- **Robust Parsing**: `splitSetCookieHeader` handles collapsed `Set-Cookie` headers
- **Manual Headers**: Uses `res.headers.append()` to prevent cookie overwrites
- **Secure Cookies**: Based on `NODE_ENV` (secure in production)

#### Frontend Components
- **Server Components**: Initial data fetching in server components
- **Client Components**: Interactive elements (upvotes, comments, view toggle)
- **Lexical Renderer**: Custom component to render Lexical rich text JSON
- **Theme Toggle**: Light/dark mode with `localStorage` persistence

### 7. Styling & UI
- **CSS Variables**: Theme system with light/dark mode support
- **Responsive Design**: Board view with flex layout, max height for columns
- **Visual Indicators**: Status badges, upvote buttons, comment counts
- **Smooth Transitions**: Hover effects, card interactions

### 8. Build & Deployment
- **Build Command**: `yarn build` (uses yarn, not pnpm)
- **Type Safety**: Fixed TypeScript errors for numeric IDs, account types, draft fields
- **Production Ready**: All build issues resolved, ready for Cloudflare Workers deployment

## Important Files

### Collections
- `src/collections/Users.ts` - User management with account types
- `src/collections/RoadmapItems.ts` - Roadmap items collection
- `src/collections/RoadmapVotes.ts` - Vote tracking with hooks
- `src/collections/RoadmapComments.ts` - Comment system with hooks

### Access Control
- `src/access/roles.ts` - Role checking utilities (`isAdmin`, `isEditorOrAdmin`)

### API Routes
- `src/app/api/auth/discord/route.ts` - OAuth initiation
- `src/app/api/auth/discord/callback/route.ts` - OAuth callback handler
- `src/app/api/auth/logout/route.ts` - Logout handler
- `src/app/api/roadmap/[id]/upvote/route.ts` - Upvote API
- `src/app/api/roadmap/[id]/comments/route.ts` - Comments API

### Frontend Pages
- `src/app/(frontend)/page.tsx` - Root redirect to roadmap
- `src/app/(frontend)/roadmap/page.tsx` - Roadmap list page
- `src/app/(frontend)/roadmap/[id]/page.tsx` - Roadmap detail page
- `src/app/(frontend)/roadmap/[id]/detail-client.tsx` - Interactive detail components
- `src/app/(frontend)/roadmap/roadmap-view.tsx` - View toggle component
- `src/app/(frontend)/roadmap/lexical-render.tsx` - Rich text renderer

### Utilities
- `src/getPayloadClient.ts` - Cached Payload instance
- `src/middleware.ts` - Admin access middleware
- `src/payload.config.ts` - Main Payload configuration

## Environment Variables Required

```bash
# Discord OAuth
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:3000/api/auth/discord/callback  # or production URL

# Payload
PAYLOAD_SECRET=your_secret_key  # Generate with: openssl rand -hex 32

# Cloudflare (for deployment)
CLOUDFLARE_ENV=production  # or staging
```

## Key Learnings & Patterns

1. **SQLite Numeric IDs**: Always handle both `number` and `string` types when working with relationships
2. **Payload Hooks**: Use `req.body` to pass data to hooks when using local API
3. **Cookie Management**: Manual header appending prevents Next.js cookie overwrites
4. **Type Assertions**: Some Payload v3 features (like `admin.access`) work at runtime but types may lag
5. **Server vs Client**: Use server components for data fetching, client components for interactivity
6. **Access Control**: Multiple layers (config, middleware, component) provide defense in depth

## Future Considerations

- Remove temporary compatibility fallback in `getEffectiveAccountType` once all users have `accountType` set
- Consider adding pagination for large roadmap lists
- Add search/filter functionality for roadmap items
- Consider adding email notifications for roadmap updates

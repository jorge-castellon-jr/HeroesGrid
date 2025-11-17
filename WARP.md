# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

HeroesGrid is a companion app for **Power Rangers: Heroes of the Grid** board game. It's a local-first PWA (Progressive Web App) built with React 19 and WatermelonDB, requiring no backend server. The app runs entirely in the browser with offline support.

**Key Characteristics:**
- Turbo monorepo (migrating from single package)
- Local-first architecture using IndexedDB via WatermelonDB
- PWA with Workbox service worker
- Deployed to Cloudflare Pages

## Common Commands

### Development
```bash
# Start development server (syncs versions first)
yarn dev

# Build all packages
yarn build

# Lint all packages
yarn lint

# Preview production build
yarn preview

# Build database (pre-seed data from JSON)
yarn build:db  # Run from apps/web/
```

### Version Management
```bash
# From apps/web/ directory
yarn version:patch  # Bump patch version (1.0.0 -> 1.0.1)
yarn version:minor  # Bump minor version (1.0.0 -> 1.1.0)
yarn version:major  # Bump major version (1.0.0 -> 2.0.0)
```

### Code Quality
```bash
# Run linter
yarn lint

# Type check (no emit)
npx tsc --noEmit  # From apps/web/

# Format code
yarn prettier  # From apps/web/
```

## Architecture

### Monorepo Structure
```
heroes-grid/
├── apps/
│   └── web/           # Main React app
│       ├── src/
│       │   ├── components/    # UI components
│       │   ├── contexts/      # React contexts
│       │   ├── database/      # WatermelonDB setup
│       │   │   ├── models/    # Database model classes
│       │   │   ├── schema.js  # Current version: 9
│       │   │   ├── migrations.js
│       │   │   └── seed.js
│       │   ├── pages/         # Route pages
│       │   ├── services/      # Business logic
│       │   └── utils/         # Helper functions
│       └── scripts/
│           ├── build-db.js            # Pre-build database
│           ├── bump-version.js        # Version management
│           └── scrape-ranger-images.js
├── packages/          # Shared packages (future)
├── docs/
│   ├── completed/     # Completed tasks
│   ├── in-progress/   # Active tasks
│   └── information/   # Reference docs
└── turbo.json         # Turborepo config
```

### Database Architecture (WatermelonDB)

**Current Schema Version:** 9

**Core Entities:**
- `rulebooks` - Game rules and FAQs
- `seasons`, `expansions` - Game content organization
- `teams` - Ranger teams with generation tracking
- `rangers` - Character cards with abilities, decks, tags
- `enemies` - Footsoldiers, monsters, bosses with decks/locations
- `zords`, `megazords` - Zord cards with team compatibility
- `ranger_cards`, `arsenal_cards` - Combat cards
- `custom_rangers` - User-created rangers
- `tags`, `locations` - Reference data

**Key Patterns:**
- Use `@json()` decorator for JSON fields (arrays/objects)
- All tables have `published` boolean for filtering
- Slugs are indexed for lookups
- Foreign keys use `_id` suffix (e.g., `team_id`)
- JSON fields store arrays/objects as strings (e.g., `deck`, `tags`)

**Schema Changes Process:**
1. Update model in `src/database/models/`
2. Increment version in `src/database/schema.js`
3. Add migration in `src/database/migrations.js`
4. Test data persistence
5. Run `yarn build` to verify

### Tech Stack

**Core:**
- React 19 with React Router v7
- Vite (build tool)
- WatermelonDB (local database)
- Tailwind CSS + Radix UI
- Yarn 4 (Berry) with node_modules

**Notable Libraries:**
- `react-hook-form` + `zod` - Form handling
- `next-themes` - Dark mode support
- `sonner` - Toast notifications
- `marked` - Markdown parsing
- `lucide-react` - Icons
- `vite-plugin-pwa` - PWA support

**Deployment:**
- Cloudflare Pages (configured in `wrangler.toml`)
- Service worker for offline support
- Pre-caching of static assets

## Development Workflow

### Before Starting Work
1. Check `docs/AI_RULES.md` for project conventions
2. Review existing patterns in similar components
3. Verify WatermelonDB schema if working with data

### During Development
1. Use `@` alias for imports (e.g., `@/components/ui/button`)
2. Follow existing component patterns (functional components + hooks)
3. Use Tailwind utility classes (check existing color palette)
4. Add `dark:` variants for dark mode support
5. Handle loading states and empty states
6. Add proper error handling

### After Changes
1. Run `yarn lint` to check for errors
2. Run `yarn build` to verify build succeeds
3. Test in browser (Chrome, Firefox, Safari)
4. Test responsive design (mobile, tablet, desktop)
5. Test dark mode toggle
6. **DO NOT commit** unless explicitly asked

### Task Management
- Create task files in `docs/in-progress/` with checkboxes
- Mark checkboxes `[x]` as you complete items
- Move to `docs/completed/` when all tasks done
- Run `yarn build` after major phases

## Important Guidelines

### Package Management
- **Always use `yarn`** (not npm or pnpm)
- Dependencies managed via node_modules (not PnP)
- Check version compatibility before adding packages

### WatermelonDB Patterns
```javascript
// Use @json() decorator for arrays/objects
@json('deck', sanitizeDeck) deck
@json('tags', sanitizeTags) tags

// Index frequently queried fields
{ name: 'slug', type: 'string', isIndexed: true }

// Use relationships for foreign keys
@relation('teams', 'team_id') team
```

### React Patterns
- Functional components with hooks
- Extract logic to custom hooks or `utils/`
- Keep components focused and composable
- Use React Router's data loading features

### Styling
- Tailwind utility classes (avoid custom CSS when possible)
- Consistent spacing/sizing with existing components
- Dark mode via `dark:` prefix
- shadcn/ui components in `components/ui/`

### Code Quality
- JSDoc comments for utility functions
- Descriptive variable names
- Validate inputs and handle edge cases
- No `console.log` in production code

## Scraping & Data Pipeline

The project includes scripts for scraping game content. When working with data:

```bash
# Scrape ranger images (example)
node apps/web/scripts/scrape-ranger-images.js

# Build pre-seeded database
yarn build:db  # From apps/web/
```

**Future Architecture Note:** The project plans to implement a Cloudflare Queue system for scraping individual pages, with status tracking (not downloaded, downloading, downloaded) to show progress in UI.

## Testing

Currently no automated test suite. Manual testing required:
- [ ] Manual testing in dev environment
- [ ] Test edge cases and error states
- [ ] Test with empty/missing data
- [ ] Verify backward compatibility
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Responsive design (mobile, tablet, desktop)

## Deployment

**Platform:** Cloudflare Pages

**Build Command:** `yarn build` (defined in `wrangler.toml`)

**Output Directory:** `apps/web/dist`

**Environment:** Node 20 (see `wrangler.toml`)

## File Locations Reference

**Configuration:**
- `turbo.json` - Turborepo task configuration
- `apps/web/vite.config.js` - Vite build config
- `apps/web/tailwind.config.js` - Tailwind styling
- `wrangler.toml` - Cloudflare deployment

**Documentation:**
- `docs/AI_RULES.md` - Detailed project rules and patterns
- `docs/information/` - Architecture and reference docs
- `docs/in-progress/` - Active task files
- `docs/completed/` - Finished task files

**Database:**
- `apps/web/src/database/schema.js` - Current schema (v9)
- `apps/web/src/database/models/` - WatermelonDB model classes
- `apps/web/src/database/migrations.js` - Schema migrations
- `apps/web/src/database/seed.js` - Initial data seeding

## Version Information

**Current Schema:** 9  
**App Version:** 2.0.0  
**Package Manager:** yarn@4.8.1  
**Node Version:** 20 (see `.nvmrc`)

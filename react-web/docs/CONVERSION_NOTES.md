# Vue to React Conversion Notes

## Status: Core Structure Complete ✅

The HeroesGrid app has been successfully converted from Nuxt.js (Vue) to React with Vite. The core architecture and main functionality are in place.

## What's Been Completed

### ✅ Infrastructure
- [x] React + Vite setup with TypeScript support
- [x] Yarn package manager configured
- [x] Tailwind CSS v4 configured with PostCSS
- [x] SCSS support added
- [x] Environment variables setup (.env)
- [x] Static assets copied (favicon, SVG icons, uploads)

### ✅ State Management
- [x] React Context API replacing Vuex
- [x] AppContext with reducer pattern
- [x] Loading state management
- [x] Data fetching structure (rangers, teams, etc.)

### ✅ Routing
- [x] React Router configured
- [x] Home route
- [x] All Rangers route
- [x] Layout structure ready for dynamic routes

### ✅ Core Components
- [x] Layout component with loading states
- [x] FooterNav with mobile menu
- [x] Loading component with animations
- [x] Logo component
- [x] PRIcons component for SVG rendering

### ✅ Pages
- [x] Home page
- [x] AllRangers page with filters (teams/colors)

### ✅ Utilities
- [x] Sanity client setup
- [x] Helper functions (getColor, friendlyURL, dashToSpace, random, getQuery)
- [x] GROQ queries for Sanity

## Known Issues to Fix

### 🔧 Tailwind CSS & SCSS

The app uses Tailwind CSS v4 which has a different import syntax. Current issues:
- SCSS files using `@apply` directives need to be updated or converted
- Some component SCSS files may need refactoring to work with Tailwind v4

**Quick Fix Options:**
1. Downgrade to Tailwind CSS v3.x for easier `@apply` support
2. Convert `@apply` directives to inline Tailwind classes
3. Use CSS-in-JS or inline styles for component-specific styling

### 📝 Missing Components

These components from the original Vue app still need to be converted:

#### Card Components
- [x] RangerCard ✅
- [x] EnemyCard ✅ 
- [x] RangerDeckSingle ✅

#### Game Components
- [x] Die (dice component) ✅

#### Other Components  
- [x] Counter ✅
- [x] RangerTeams ✅
- [x] NavBar ✅

### 📄 Missing Pages
- [ ] AllTeams
- [ ] Randomizer
- [ ] Dice Roller
- [ ] Tokens (Token Tracker)
- [ ] Enemies
- [ ] Countdown
- [ ] Rulebooks (index)
- [ ] Rulebook Single (dynamic route)
- [ ] Team Index (dynamic route /:team)
- [ ] Ranger Page (dynamic route /:team/:ranger)

## Environment Setup

Make sure to set these environment variables in `.env`:

```env
VITE_SANITY_PROJECT_ID=your-actual-sanity-project-id
VITE_VERSION_NUMBER=1.3.2
```

## Running the App

```bash
# Development
yarn dev

# Build
yarn build

# Preview production build
yarn preview
```

## Next Steps

### Priority 1: Fix Tailwind/SCSS Issues
1. Choose Tailwind approach (v3 vs v4 vs alternative)
2. Update component SCSS files accordingly
3. Test that styles render correctly

### Priority 2: Complete Core Components
1. Create RangerCard component (used heavily in AllRangers)
2. Create EnemyCard component
3. Test component rendering with real data

### Priority 3: Add Remaining Pages
1. Create placeholder pages for all routes
2. Implement routing for dynamic pages
3. Add page-specific logic and data fetching

### Priority 4: Content Management
The original app used `@nuxt/content` for markdown content. Need to decide on approach:
- Use a markdown parser (marked.js is already installed)
- Fetch markdown from Sanity
- Use a different content solution

### Priority 5: Testing & Polish
1. Test all user flows
2. Verify identical behavior to Vue version
3. Test responsive design
4. Performance optimization
5. Add error boundaries
6. Improve loading states

## Migration to Turbo Monorepo

As noted in the user's rules, this project will eventually be moved to a Turbo monorepo structure. The current standalone structure is designed to facilitate that transition:

- Keep dependencies minimal and explicit
- Maintain clear separation of concerns
- Document shared utilities that could become packages
- Structure directories for easy migration (`apps/web`)

## Technical Debt & Improvements

- Consider adding TypeScript for better type safety
- Add proper error handling and error boundaries
- Implement proper data loading skeletons
- Add unit tests with Vitest
- Add E2E tests with Playwright
- Optimize bundle size
- Add PWA manifest and service worker support

## Notes

- The original Nuxt app used server-side rendering (SSR). The React version is client-side only (SPA).
- Some Nuxt-specific features (like nuxt-content) need alternative solutions
- The Sanity integration structure is preserved but may need adjustments
- Static assets have been copied but paths might need verification
- The version number is currently hardcoded but could come from package.json

# HeroesGrid Migration Checklist

## Project Structure
- [ ] Move `web` package into `apps` folder
- [ ] Convert project to Turbo monorepo structure
- [ ] Set up Turbo configuration
- [ ] Configure Cloudflare queue system for scraping
- [ ] Add queue status tracking (enum: not downloaded, downloading, downloaded)

## Sanity Client Setup
- [ ] **REVIEW NEEDED**: Update Sanity client to use modern approach (`@sanity/client` v6+)
- [ ] Verify proper CDN usage in production vs development
- [ ] Ensure environment variables are properly configured
- [ ] Test all Sanity queries still work after migration

## Components Migrated
### Layout Components
- [x] `components/layout/NavBar.vue`
- [x] `components/layout/FooterNav.vue`
- [x] `components/layout/Logo.vue`
- [x] `components/layout/Loading.vue`

### Card Components
- [x] `components/cards/RangerCard.vue`
- [x] `components/cards/EnemyCard.vue`
- [x] `components/cards/RangerDeckSingle.vue`

### Game Components
- [x] `components/gameComponents/Die.vue`

### Other Components
- [x] `components/Counter.vue`
- [x] `components/EnemyCard.vue` (duplicate? check if different from cards/EnemyCard.vue)
- [x] `components/PRIcons.vue`
- [x] `components/RangerTeams.vue`

## Pages Migrated
- [ ] `pages/index.vue` (Homepage)
- [ ] `pages/all-rangers.vue`
- [ ] `pages/all-teams.vue`
- [ ] `pages/randomizer.vue`
- [ ] `pages/enemies.vue`
- [ ] `pages/dice.vue`
- [ ] `pages/Tokens.vue`
- [ ] `pages/Countdown.vue`
- [ ] `pages/_team/index.vue` (Dynamic team page)
- [ ] `pages/_team/index/_ranger.vue` (Dynamic ranger page)
- [ ] `pages/rulebooks/index.vue`
- [ ] `pages/rulebooks/_slug.vue` (Dynamic rulebook page)

## Plugins
- [ ] `plugins/sanityClient.js` - Sanity client setup
- [ ] `plugins/util.js` - Utility functions (getColor, friendlyURL, dashToSpace, random, getQuery)
- [ ] `plugins/route.js` - Route utilities

## Middleware
- [ ] `middleware/vuex.js` - Vuex middleware for routing

## Store (Vuex)
- [ ] `store/index.js` - State management (rangers, teams, footSoldiers, monsters, bosses, loading)

## Layouts
- [ ] `layouts/default.vue` - Default layout

## Configuration Files
- [ ] `nuxt.config.js` - Nuxt configuration
- [ ] `tailwind.config.js` - Tailwind CSS configuration
- [ ] `package.json` - Dependencies and scripts
- [ ] `jsconfig.json` - JavaScript configuration
- [ ] `.prettierrc` - Prettier configuration

## Assets & Styles
- [ ] `assets/scss/index.scss` - Main SCSS file and all imported styles
- [ ] All other SCSS partials
- [ ] Verify Tailwind integration works

## Static Files
- [ ] `static/favicon/*` - All favicon files
- [ ] `static/` - Any other static assets (images, fonts, etc.)

## Content
- [ ] `content/index.md` - Homepage content
- [ ] All other content files used by @nuxt/content

## Router Configuration
- [ ] `app/router.scrollBehavior.js` - Custom scroll behavior

## Logic & Utilities to Review
- [ ] **Sanity Queries** - All GROQ queries in `plugins/util.js`
  - [ ] allData query
  - [ ] allRangers query
  - [ ] singleRanger query
  - [ ] allTeamsWithRangers query
  - [ ] allTeams query
  - [ ] rangersByColor query
  - [ ] teamRangers query
  - [ ] getRulebookSingle query
- [ ] **Color System** - getColor utility function mapping
- [ ] **URL Utilities** - friendlyURL and dashToSpace functions
- [ ] **State Management** - Vuex store state, mutations, getters, actions
- [ ] **Loading States** - Verify loading state management across all pages

## Testing & Verification
- [ ] Test all routes work after migration
- [ ] Verify Sanity data fetching on all pages
- [ ] Test randomizer functionality
- [ ] Test filtering on all-rangers page
- [ ] Verify images load correctly from Sanity CDN
- [ ] Test PWA functionality (@nuxtjs/pwa)
- [ ] Test responsive design on mobile/tablet
- [ ] Verify color system works for all ranger colors
- [ ] Test dice roller functionality
- [ ] Test token counter functionality
- [ ] Verify rulebook pages work

## New Features to Implement
- [ ] Set up Cloudflare Queue infrastructure
- [ ] Create queue status tracking system
- [ ] Build UI to display download progress
- [ ] Implement individual page scraping via queue

## Post-Migration
- [ ] Update README with new monorepo structure
- [ ] Update package.json scripts for monorepo
- [ ] Set up proper build pipeline
- [ ] Configure deployment for monorepo structure
- [ ] Update environment variable documentation
- [ ] Run lint/typecheck on migrated code
- [ ] Performance audit

## Notes
- **Sanity Client Version**: Currently using v2.11.0 - Consider upgrading to v6+ for better TypeScript support and modern features
- **Duplicate Component**: Check if `components/EnemyCard.vue` is different from `components/cards/EnemyCard.vue`
- **Dynamic Routes**: Nuxt 2 uses `_slug.vue` pattern for dynamic routes - ensure this works in new structure
- **PWA**: Project uses @nuxtjs/pwa - ensure this is compatible with monorepo structure

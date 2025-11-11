# HeroesGrid Turborepo Migration Plan

## Phase 1: Setup & Clean Migration ✅
- [x] Backup current project (git commit or branch)
- [x] Initialize new Turborepo structure at root level
- [x] Create `apps/` and `packages/` directories
- [x] Move `react-web` to `apps/web` (rename during move)
- [x] Update `apps/web/package.json` name to `@heroes-grid/web`
- [x] Remove old Lerna config and dependencies from root
- [x] Clean up unused folders (`web/`, `studio/`) from root
- [x] Create root `turbo.json` with pipeline configuration
- [x] Update root `package.json` with Turborepo scripts and workspaces
- [x] Configure Yarn 4 with `nodeLinker: node-modules`
- [x] Test `turbo dev` successfully starts Vite

## Phase 2: Create API Package (tRPC + Cloudflare Worker)
- [ ] Create `apps/api` directory structure
- [ ] Initialize Cloudflare Worker with Wrangler
- [ ] Set up tRPC server configuration
- [ ] Install and configure Drizzle ORM with D1
- [ ] Create Drizzle schema for custom rangers (character data, stats, abilities)
- [ ] Set up database migrations folder structure
- [ ] Create initial tRPC router for ranger CRUD operations
- [ ] Configure CORS for local development with web app
- [ ] Add `apps/api/package.json` with dependencies
- [ ] Add Wrangler configuration (`wrangler.toml`)

## Phase 3: Shared Packages Setup
- [ ] Create `packages/database` for shared Drizzle schemas and types
- [ ] Create `packages/typescript-config` for shared tsconfig.json files
- [ ] Create `packages/eslint-config` for shared ESLint configuration
- [ ] Create `packages/types` for shared TypeScript types between web and api
- [ ] Set up proper package exports and dependencies

## Phase 4: Print-to-Play PDF Feature
- [ ] Research PDF generation library (PDFKit, jsPDF, or Puppeteer)
- [ ] Create `packages/pdf-generator` for shared PDF logic
- [ ] Design card template layout (10-card deck structure)
- [ ] Implement character card PDF generation
- [ ] Implement Zord card PDF generation
- [ ] Add print guides/cut lines to PDF output
- [ ] Integrate PDF download into web app UI
- [ ] Add tRPC endpoint for server-side PDF generation (optional)

## Phase 5: Authentication System (Discord OAuth)
- [ ] Set up Discord OAuth application in Discord Developer Portal
- [ ] Install authentication libraries (Auth.js / next-auth or similar)
- [ ] Add user table to Drizzle schema
- [ ] Implement Discord OAuth flow in API
- [ ] Create session management with D1
- [ ] Add protected tRPC procedures
- [ ] Implement user context in web app
- [ ] Add login/logout UI components
- [ ] Create user profile page

## Phase 6: User Rangers & Teams System
- [ ] Create database schema for saved rangers (user_id, ranger_data, created_at)
- [ ] Create database schema for teams (team composition, sharing settings)
- [ ] Add tRPC mutations for saving/updating/deleting rangers
- [ ] Add tRPC mutations for creating/managing teams
- [ ] Implement "My Rangers" page in web app
- [ ] Implement "My Teams" page in web app
- [ ] Add share functionality (generate shareable URLs)
- [ ] Implement public ranger/team view pages

## Phase 7: Community Features
- [ ] Create community rangers database table (public flag, likes, views)
- [ ] Add tRPC queries for fetching community rangers
- [ ] Implement pagination for community page
- [ ] Add URL-based sorting (newest, popular, most-liked)
- [ ] Add URL-based filtering (by power type, era, etc.)
- [ ] Create community page UI with grid/list view
- [ ] Add like/favorite functionality
- [ ] Add search functionality for community rangers
- [ ] Implement ranger detail modal/page from community

## Phase 8: Final Polish & Deployment
- [ ] Update all inter-package dependencies in `package.json` files
- [ ] Test all Turborepo tasks (`turbo build`, `turbo dev`, `turbo lint`)
- [ ] Configure Cloudflare Pages for web app deployment
- [ ] Configure Cloudflare Worker deployment for API
- [ ] Set up D1 database in Cloudflare production
- [ ] Add environment variables documentation
- [ ] Update README.md with new structure and commands
- [ ] Test full workflow: dev → build → deploy
- [ ] Clean up any remaining legacy code/config

---

## Notes
This plan transforms the project from a Lerna monorepo to a modern Turborepo setup with a clear separation between the web app and API, while setting the foundation for all planned features. The phases are ordered logically so each builds upon the previous one.

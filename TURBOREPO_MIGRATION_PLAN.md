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

## Phase 2: Deploy Web to Cloudflare Pages ✅
- [x] Configure build command and output directory in package.json
- [x] Create Cloudflare Pages project
- [x] Set up environment variables in Cloudflare dashboard
- [x] Configure custom domain (if applicable)
- [x] Test deployment and verify site works
- [x] Set up automatic deployments from git
- [x] Add version from package.json to footer
- [x] Move reset database button to admin page

## Phase 3: User Rangers & Teams System (Local First)
**REMINDER: Build local-first with WatermelonDB. Cloud sync comes later.**
- [ ] Create WatermelonDB schema for custom rangers (user-created, not from game data)
- [ ] Create WatermelonDB schema for teams (team composition, local storage)
- [ ] Implement "Create Custom Ranger" page in web app
- [ ] Implement ranger builder UI (name, stats, abilities, custom fields)
- [ ] Implement "My Rangers" page with CRUD operations
- [ ] Implement "My Teams" page with team builder
- [ ] Add local export/import functionality (JSON backup)
- [ ] Test all local data persistence and retrieval

## Phase 4: Print-to-Play PDF Feature
- [ ] Research PDF generation library (PDFKit, jsPDF, or Puppeteer)
- [ ] Design card template layout (10-card deck structure)
- [ ] Implement character card PDF generation in web app
- [ ] Implement Zord card PDF generation in web app
- [ ] Add print guides/cut lines to PDF output
- [ ] Integrate PDF download button into web app UI
- [ ] Test PDF generation with different rangers and zords

## Phase 5: Create API Package (tRPC + Cloudflare Worker)
- [ ] Create `apps/api` directory structure
- [ ] Initialize Cloudflare Worker with Wrangler
- [ ] Set up tRPC server configuration
- [ ] Install and configure Drizzle ORM with D1
- [ ] Create Drizzle schema for game data (rangers, teams, expansions, etc.)
- [ ] Set up database migrations folder structure
- [ ] Create initial tRPC router for game data queries
- [ ] Configure CORS for local development with web app
- [ ] Add `apps/api/package.json` with dependencies
- [ ] Add Wrangler configuration (`wrangler.toml`)
- [ ] Deploy API to Cloudflare Workers
- [ ] Test API endpoints from deployed web app

## Phase 6: Authentication System (Discord OAuth)
- [ ] Set up Discord OAuth application in Discord Developer Portal
- [ ] Install authentication libraries (Auth.js / next-auth or similar)
- [ ] Add user table to Drizzle schema
- [ ] Implement Discord OAuth flow in API
- [ ] Create session management with D1
- [ ] Add protected tRPC procedures
- [ ] Implement user context in web app
- [ ] Add login/logout UI components
- [ ] Create user profile page

## Phase 7: Cloud Sync for User Data
**REMINDER: This syncs local WatermelonDB data to D1 (local-first architecture)**
- [ ] Create D1 schema for user rangers (user_id, ranger_data, created_at)
- [ ] Create D1 schema for user teams (team composition, sharing settings)
- [ ] Add tRPC mutations for syncing local rangers to cloud
- [ ] Add tRPC mutations for syncing local teams to cloud
- [ ] Implement sync strategy (last-write-wins or conflict resolution)
- [ ] Add "Sync to Cloud" button in My Rangers/Teams pages
- [ ] Add sync status indicator in UI
- [ ] Test bi-directional sync (local → cloud → local)
- [ ] Add share functionality (generate shareable URLs from cloud data)
- [ ] Implement public ranger/team view pages

## Phase 8: Community Features
- [ ] Create community rangers database table (public flag, likes, views)
- [ ] Add tRPC queries for fetching community rangers
- [ ] Implement pagination for community page
- [ ] Add URL-based sorting (newest, popular, most-liked)
- [ ] Add URL-based filtering (by power type, era, etc.)
- [ ] Create community page UI with grid/list view
- [ ] Add like/favorite functionality
- [ ] Add search functionality for community rangers
- [ ] Implement ranger detail modal/page from community

## Phase 9: Final Polish
- [ ] Update all inter-package dependencies in `package.json` files
- [ ] Test all Turborepo tasks (`turbo build`, `turbo dev`, `turbo lint`)
- [ ] Add environment variables documentation
- [ ] Update README.md with new structure and commands
- [ ] Clean up any remaining legacy code/config
- [ ] Add contribution guidelines

---

## Notes
This plan transforms the project from a Lerna monorepo to a modern Turborepo setup with a clear separation between the web app and API, while setting the foundation for all planned features. The phases are ordered logically so each builds upon the previous one.

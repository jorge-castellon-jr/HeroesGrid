# HeroesGrid API

tRPC API for HeroesGrid, deployed as a Cloudflare Worker with D1 database.

## Tech Stack

- **tRPC** - Type-safe API framework
- **Drizzle ORM** - TypeScript ORM for D1
- **Cloudflare Workers** - Serverless deployment
- **Cloudflare D1** - SQLite-based database
- **TypeScript** - Type safety

## Project Structure

```
apps/api/
├── src/
│   ├── db/
│   │   ├── schema.ts          # Drizzle schema definitions
│   │   └── migrations/        # Database migrations
│   ├── routers/
│   │   └── gameData.ts        # Game data queries
│   ├── context.ts             # tRPC context (DB connection)
│   ├── trpc.ts                # tRPC initialization
│   ├── router.ts              # Main app router
│   └── index.ts               # Cloudflare Worker entry point
├── drizzle.config.ts          # Drizzle ORM configuration
├── wrangler.toml              # Cloudflare Worker config
├── package.json
└── tsconfig.json
```

## Setup

### 1. Install Dependencies

```bash
# From the root of the monorepo
yarn install

# Or from this directory
cd apps/api && yarn install
```

### 2. Create D1 Database

```bash
# Create the D1 database
wrangler d1 create heroes-grid-db

# Copy the database_id from output and add to wrangler.toml
```

Update `wrangler.toml` with the database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "heroes-grid-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 3. Generate and Run Migrations

```bash
# Generate migration from schema
yarn db:generate

# Apply migration locally
yarn db:migrate

# Or for production
yarn db:migrate:prod
```

### 4. Set Up Environment Variables (Optional)

Create a `.dev.vars` file for local development:

```bash
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_DATABASE_ID=your_database_id
CLOUDFLARE_D1_TOKEN=your_token
```

## Development

### Start Local Development Server

```bash
yarn dev
```

The API will be available at `http://localhost:8787/trpc`

### View Database with Drizzle Studio

```bash
yarn db:studio
```

Opens a web interface to view and manage your D1 database.

## API Routes

All routes are prefixed with `/trpc` and use tRPC's query/mutation format.

### Custom Rangers Router (`customRangers`)

**Queries:**
- `customRangers.getPublished({ limit, offset, sortBy })` - Get published custom rangers for community page
  - Supports sorting: 'recent', 'popular', 'likes'
  - Pagination with limit/offset
- `customRangers.getById({ id })` - Get specific custom ranger (increments views)
- `customRangers.getByUserSlug({ userId, slug })` - Get user's ranger by slug
- `customRangers.getMyRangers({ userId })` - Get all rangers for a user

**Mutations:**
- `customRangers.create({ ...data })` - Create new custom ranger
- `customRangers.update({ id, userId, ...updates })` - Update existing ranger
- `customRangers.delete({ id, userId })` - Delete custom ranger

> **Note:** Mutations require authentication in Phase 6. Currently using userId parameter, will be replaced with session context.

### Example Usage (from web app)

```typescript
// Initialize tRPC client
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@heroes-grid/api';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://your-worker.workers.dev/trpc',
    }),
  ],
});

// Fetch published custom rangers for community page
const customRangers = await trpc.customRangers.getPublished.query({
  limit: 20,
  offset: 0,
  sortBy: 'recent'
});

// Fetch specific custom ranger
const ranger = await trpc.customRangers.getById.query({ 
  id: 'ranger-uuid' 
});

// Create custom ranger (will require auth in Phase 6)
await trpc.customRangers.create.mutate({
  userId: 'user-id',
  name: 'Crimson Ranger',
  slug: 'crimson-ranger',
  color: 'red',
  type: 'core',
  abilityName: 'Crimson Strike',
  ability: 'Deal 2 damage to target enemy',
  deck: JSON.stringify([...]) // Card array as JSON
});
```

## Deployment

### Deploy to Cloudflare Workers

```bash
# Deploy to production
yarn deploy
```

### Environment Setup

1. Log in to Wrangler (first time only):
   ```bash
   wrangler login
   ```

2. Run migrations on production:
   ```bash
   yarn db:migrate:prod
   ```

3. Deploy the worker:
   ```bash
   yarn deploy
   ```

The API will be deployed to `https://heroes-grid-api.YOUR-SUBDOMAIN.workers.dev`

## Architecture: Local-First with Cloud Sync

**Important:** Official game data (rangers, teams, expansions, etc.) is stored locally in the web app's WatermelonDB (IndexedDB). The D1 database only stores **user-created content** and **authentication data**.

### Why This Approach?
1. **Offline-first:** Game data works without internet
2. **Performance:** Local data access is instant
3. **Simplicity:** No need to seed/maintain game data in the cloud
4. **Cost-effective:** Minimal cloud storage needed

## Database Schema

### User Tables

- **users** - User authentication and profile
  - Discord OAuth data (id, username, avatar)
  - Created/updated timestamps
  - Last login tracking

- **sessions** - Authentication sessions
  - Session tokens with expiration
  - Linked to users (cascade delete)

- **user_settings** - User preferences
  - Theme (light/dark/system)
  - Email notifications
  - Public profile toggle
  - Additional preferences (JSON)

### User Content Tables

- **custom_rangers** - User-created rangers
  - Full ranger data (name, color, type, ability, deck)
  - Team assignment (references official teams by ID)
  - Published flag for community sharing
  - View and like counts
  - Linked to users (cascade delete)

- **custom_ranger_likes** - Like tracking
  - User-ranger relationship
  - Timestamps

## CORS Configuration

The API is configured with permissive CORS for local development:

```javascript
'Access-Control-Allow-Origin': '*'
'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
'Access-Control-Allow-Headers': 'Content-Type, Authorization'
```

For production, consider restricting the `Access-Control-Allow-Origin` to your deployed domain.

## Type Safety

The API exports its TypeScript types for use in the web app:

```typescript
export type { AppRouter } from './src/router';
```

This enables full end-to-end type safety between the API and web app.

## Future Enhancements

Phase 6+:
- User authentication (Discord OAuth)
- User rangers and teams sync
- Community features (likes, views, sharing)
- Rate limiting
- Caching layer

## Troubleshooting

### Build Errors

```bash
# Clear Wrangler cache
rm -rf .wrangler

# Reinstall dependencies
rm -rf node_modules
yarn install
```

### Database Issues

```bash
# View local database
wrangler d1 execute heroes-grid-db --local --command "SELECT * FROM sqlite_master WHERE type='table';"

# View remote database
wrangler d1 execute heroes-grid-db --remote --command "SELECT * FROM sqlite_master WHERE type='table';"
```

### Type Errors

Make sure TypeScript is using the correct types:

```bash
# Type check
npx tsc --noEmit
```

## Links

- [tRPC Documentation](https://trpc.io)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1)

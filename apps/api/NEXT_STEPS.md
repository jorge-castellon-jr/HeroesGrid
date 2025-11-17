# Next Steps: Deploying the HeroesGrid API

Phase 5 is complete! The API structure is in place. Here's what to do next:

## 1. Create D1 Database

```bash
cd apps/api

# Create D1 database
wrangler d1 create heroes-grid-db
```

This will output a database ID. Copy it and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "heroes-grid-db"
database_id = "YOUR_DATABASE_ID_HERE"  # Paste the ID here
```

## 2. Generate Initial Migration

```bash
# Generate migration from schema
yarn db:generate
```

This creates a migration file in `drizzle/migrations/` with SQL to create all tables.

## 3. Run Migration Locally

```bash
# Apply migration to local D1 database
# Replace MIGRATION_FILE.sql with the actual filename
yarn db:migrate
```

## 4. Test Locally

```bash
# Start local development server
yarn dev
```

The API will be available at `http://localhost:8787/trpc`

Test with a simple query (you can use curl or Postman):

```bash
curl http://localhost:8787/trpc/gameData.getTeams
```

## 5. Deploy to Cloudflare Workers

```bash
# Login to Cloudflare (first time only)
wrangler login

# Run migration on production database
yarn db:migrate:prod

# Deploy worker
yarn deploy
```

## 6. Seed Data (Future)

You'll need to populate the D1 database with game data. Options:

1. **Manual via Drizzle Studio:**
   ```bash
   yarn db:studio
   ```

2. **Import from WatermelonDB:**
   - Export data from web app's IndexedDB
   - Create a seed script to transform and insert into D1
   - Run seed script against D1 database

3. **API mutation endpoints:**
   - Create tRPC mutations for inserting data
   - Build admin interface in web app

## 7. Connect Web App (Phase 6+)

Once deployed, update the web app to use the API:

```typescript
// In apps/web, install tRPC client
yarn add @trpc/client @trpc/react-query @tanstack/react-query

// Create tRPC client
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@heroes-grid/api';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://heroes-grid-api.YOUR-SUBDOMAIN.workers.dev/trpc',
    }),
  ],
});
```

## Verification Checklist

- [ ] D1 database created and ID added to wrangler.toml
- [ ] Initial migration generated
- [ ] Migration applied locally
- [ ] Local dev server starts without errors
- [ ] Can query test endpoint locally
- [ ] Logged in to Cloudflare via Wrangler
- [ ] Migration applied to production D1
- [ ] Worker deployed successfully
- [ ] Production API endpoint is accessible

## Troubleshooting

### Database not found
Make sure the database_id in wrangler.toml matches the one from `wrangler d1 create`.

### Migration fails
Check the SQL in the migration file. You might need to adjust field types or constraints.

### CORS errors
The API is configured with permissive CORS for development. For production, update the `Access-Control-Allow-Origin` in `src/index.ts`.

### Type errors
Run `npx tsc --noEmit` from `apps/api/` to check for TypeScript errors.

## Phase 6 Preview

After Phase 5, you'll implement:
- Discord OAuth authentication
- User session management
- Protected tRPC procedures
- Login/logout UI in web app

See `docs/in-progress/TURBOREPO_MIGRATION_PLAN.md` for full Phase 6 details.

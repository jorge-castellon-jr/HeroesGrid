# Local Setup Complete ✅

**Date:** 2025-01-17  
**Status:** Ready for local testing

## What Was Done

### 1. Upgraded Wrangler
- ✅ Upgraded from 3.3.0 → 4.47.0
- ✅ Fixed local D1 database access issues
- ✅ Updated all package.json scripts to use `npx wrangler`

### 2. Applied Migration Locally
- ✅ Migration: `0000_fantastic_franklin_storm.sql`
- ✅ 5 tables created successfully:
  - `users` - Authentication and profile
  - `sessions` - Auth tokens
  - `user_settings` - User preferences
  - `custom_rangers` - User-created rangers
  - `custom_ranger_likes` - Like tracking

### 3. Dev Server Running
- ✅ Local API: `http://localhost:8787`
- ✅ D1 Database: Local SQLite in `.wrangler/state/v3/d1/`
- ✅ Binding: `env.DB` available in worker

## Testing the API

### Start Dev Server
```bash
cd apps/api
yarn dev
```

Server runs at: `http://localhost:8787`

### Query the Database
```bash
# List all tables
yarn db:query "SELECT name FROM sqlite_master WHERE type='table';"

# Count rangers (should be 0)
yarn db:query "SELECT COUNT(*) as count FROM custom_rangers;"

# List all users (should be 0)
yarn db:query "SELECT * FROM users;"
```

### Test tRPC Endpoints

The API uses tRPC at `/trpc` endpoint:

```bash
# Test getPublished endpoint (empty initially)
curl http://localhost:8787/trpc/customRangers.getPublished

# Test with query parameters
curl "http://localhost:8787/trpc/customRangers.getPublished?input=%7B%22limit%22%3A10%7D"
```

## Available Commands

```bash
# Development
yarn dev                 # Start dev server (local D1)

# Database
yarn db:generate         # Generate new migration
yarn db:migrate          # Apply migration to local
yarn db:migrate:prod     # Apply migration to production
yarn db:studio           # Open Drizzle Studio (GUI)
yarn db:query "SQL"      # Run SQL query on local DB

# Deployment
yarn build               # Type check
yarn deploy              # Deploy to Cloudflare Workers
```

## API Endpoints

### `/trpc/customRangers.*`

**Queries:**
- `getPublished({ limit, offset, sortBy })` - Community rangers
- `getById({ id })` - Single ranger
- `getByUserSlug({ userId, slug })` - User's ranger
- `getMyRangers({ userId })` - All user's rangers

**Mutations:**
- `create({ ...data })` - Create ranger
- `update({ id, userId, ...data })` - Update ranger
- `delete({ id, userId })` - Delete ranger

## Next Steps

1. **Connect Web App**
   - Install tRPC client in `apps/web`
   - Configure API URL: `http://localhost:8787/trpc`
   - Test queries from web app

2. **Test CRUD Operations**
   - Create test custom ranger
   - Verify data persists in D1
   - Test view/like counters

3. **Phase 6: Authentication**
   - Implement Discord OAuth
   - Add protected procedures
   - Test session management

## Database Schema

### users
- Authentication via Discord OAuth
- Profile data (username, avatar)
- Timestamps

### sessions
- Token-based auth
- Expiration tracking
- Foreign key to users (cascade)

### user_settings
- Theme preference
- Email notifications
- Public profile toggle
- Additional preferences (JSON)

### custom_rangers
- Full ranger data (name, color, type, ability, deck)
- Team assignment (official or custom)
- Published flag for community
- View and like counters
- Foreign key to users (cascade)

### custom_ranger_likes
- User → Ranger relationship
- Prevents duplicate likes
- Timestamp tracking

## Architecture Notes

- **Official game data:** Stays in WatermelonDB (web app)
- **User content:** Synced to D1 (API)
- **Local-first:** Web app works offline with local data
- **Cloud sync:** Custom rangers backed up to D1

## Troubleshooting

### Dev server won't start
```bash
# Clear wrangler state
rm -rf .wrangler

# Restart dev server
yarn dev
```

### Migration issues
```bash
# Check tables exist
yarn db:query "SELECT name FROM sqlite_master WHERE type='table';"

# Re-apply migration if needed
yarn db:migrate
```

### Type errors
```bash
# Check TypeScript
yarn build
```

---

**Status:** Ready for web app integration  
**Next:** Install tRPC client in web app and test connection

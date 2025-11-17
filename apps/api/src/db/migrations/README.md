# Database Migrations

This directory contains Drizzle ORM migrations for the HeroesGrid API D1 database.

## Setup Instructions

### 1. Create D1 Database (One-time setup)

```bash
# Create local D1 database
wrangler d1 create heroes-grid-db

# Copy the database_id from the output and update wrangler.toml
```

### 2. Generate Migrations

After modifying the schema in `src/db/schema.ts`:

```bash
yarn db:generate
```

This will create a new migration file in `drizzle/migrations/`.

### 3. Run Migrations

**Local development:**
```bash
# Replace MIGRATION_FILE with the actual migration filename
yarn db:migrate
```

**Production:**
```bash
yarn db:migrate:prod
```

### 4. View Database

```bash
# Open Drizzle Studio to view database
yarn db:studio
```

## Migration Workflow

1. Modify schema in `src/db/schema.ts`
2. Run `yarn db:generate` to create migration
3. Review the generated SQL in `drizzle/migrations/`
4. Run `yarn db:migrate` to apply locally
5. Test the changes
6. Deploy and run `yarn db:migrate:prod` for production

## Initial Migration

The initial migration creates all the game data tables:
- rulebooks
- seasons
- expansions
- teams
- rangers
- enemies
- zords
- megazords
- ranger_cards
- arsenal_cards
- tags
- locations

Each table includes timestamps (`created_at`, `updated_at`) and a `published` flag for content management.

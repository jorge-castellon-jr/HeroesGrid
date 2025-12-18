import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`polls\` ADD \`poll_type\` text DEFAULT 'select' NOT NULL;`)
  await db.run(sql`ALTER TABLE \`polls\` ADD \`max_selections\` numeric DEFAULT 1 NOT NULL;`)
  await db.run(sql`ALTER TABLE \`poll_votes\` ADD \`option_indices\` text NOT NULL;`)
  await db.run(sql`ALTER TABLE \`poll_votes\` DROP COLUMN \`option_index\`;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`poll_votes\` ADD \`option_index\` numeric NOT NULL;`)
  await db.run(sql`ALTER TABLE \`poll_votes\` DROP COLUMN \`option_indices\`;`)
  await db.run(sql`ALTER TABLE \`polls\` DROP COLUMN \`poll_type\`;`)
  await db.run(sql`ALTER TABLE \`polls\` DROP COLUMN \`max_selections\`;`)
}

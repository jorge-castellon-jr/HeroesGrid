import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`roadmap_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`summary\` text,
  	\`details\` text,
  	\`status\` text DEFAULT 'planned' NOT NULL,
  	\`priority\` numeric DEFAULT 0,
  	\`upvote_count\` numeric DEFAULT 0,
  	\`comment_count\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`roadmap_items_updated_at_idx\` ON \`roadmap_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_items_created_at_idx\` ON \`roadmap_items\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`roadmap_votes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`item_id\` integer NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`item_id\`) REFERENCES \`roadmap_items\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`roadmap_votes_item_idx\` ON \`roadmap_votes\` (\`item_id\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_votes_user_idx\` ON \`roadmap_votes\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_votes_updated_at_idx\` ON \`roadmap_votes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_votes_created_at_idx\` ON \`roadmap_votes\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`roadmap_comments\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`item_id\` integer NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`body\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`item_id\`) REFERENCES \`roadmap_items\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`roadmap_comments_item_idx\` ON \`roadmap_comments\` (\`item_id\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_comments_user_idx\` ON \`roadmap_comments\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_comments_updated_at_idx\` ON \`roadmap_comments\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`roadmap_comments_created_at_idx\` ON \`roadmap_comments\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`discord_id\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`discord_username\` text;`)
  await db.run(sql`ALTER TABLE \`users\` ADD \`discord_avatar\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_discord_id_idx\` ON \`users\` (\`discord_id\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`roadmap_items_id\` integer REFERENCES roadmap_items(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`roadmap_votes_id\` integer REFERENCES roadmap_votes(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`roadmap_comments_id\` integer REFERENCES roadmap_comments(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roadmap_items_id_idx\` ON \`payload_locked_documents_rels\` (\`roadmap_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roadmap_votes_id_idx\` ON \`payload_locked_documents_rels\` (\`roadmap_votes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roadmap_comments_id_idx\` ON \`payload_locked_documents_rels\` (\`roadmap_comments_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`roadmap_items\`;`)
  await db.run(sql`DROP TABLE \`roadmap_votes\`;`)
  await db.run(sql`DROP TABLE \`roadmap_comments\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`DROP INDEX \`users_discord_id_idx\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`discord_id\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`discord_username\`;`)
  await db.run(sql`ALTER TABLE \`users\` DROP COLUMN \`discord_avatar\`;`)
}

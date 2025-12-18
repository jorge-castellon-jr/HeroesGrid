import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`polls_options\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`text\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`polls\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`polls_options_order_idx\` ON \`polls_options\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`polls_options_parent_id_idx\` ON \`polls_options\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`polls\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`details\` text,
  	\`end_date\` text,
  	\`is_active\` integer DEFAULT true,
  	\`total_votes\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`polls_updated_at_idx\` ON \`polls\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`polls_created_at_idx\` ON \`polls\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`poll_votes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`poll_id\` integer NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`option_index\` numeric NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`poll_id\`) REFERENCES \`polls\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`poll_votes_poll_idx\` ON \`poll_votes\` (\`poll_id\`);`)
  await db.run(sql`CREATE INDEX \`poll_votes_user_idx\` ON \`poll_votes\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`poll_votes_updated_at_idx\` ON \`poll_votes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`poll_votes_created_at_idx\` ON \`poll_votes\` (\`created_at\`);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`polls_id\` integer REFERENCES polls(id);`)
  await db.run(sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`poll_votes_id\` integer REFERENCES poll_votes(id);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_polls_id_idx\` ON \`payload_locked_documents_rels\` (\`polls_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_poll_votes_id_idx\` ON \`payload_locked_documents_rels\` (\`poll_votes_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`polls_options\`;`)
  await db.run(sql`DROP TABLE \`polls\`;`)
  await db.run(sql`DROP TABLE \`poll_votes\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`roadmap_items_id\` integer,
  	\`roadmap_votes_id\` integer,
  	\`roadmap_comments_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`roadmap_items_id\`) REFERENCES \`roadmap_items\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`roadmap_votes_id\`) REFERENCES \`roadmap_votes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`roadmap_comments_id\`) REFERENCES \`roadmap_comments\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "roadmap_items_id", "roadmap_votes_id", "roadmap_comments_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "roadmap_items_id", "roadmap_votes_id", "roadmap_comments_id" FROM \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roadmap_items_id_idx\` ON \`payload_locked_documents_rels\` (\`roadmap_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roadmap_votes_id_idx\` ON \`payload_locked_documents_rels\` (\`roadmap_votes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_roadmap_comments_id_idx\` ON \`payload_locked_documents_rels\` (\`roadmap_comments_id\`);`)
}

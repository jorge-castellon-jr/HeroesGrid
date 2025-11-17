CREATE TABLE `custom_ranger_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`custom_ranger_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`custom_ranger_id`) REFERENCES `custom_rangers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `custom_rangers` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`title` text,
	`card_title` text,
	`color` text NOT NULL,
	`type` text NOT NULL,
	`ability_name` text NOT NULL,
	`ability` text NOT NULL,
	`deck` text NOT NULL,
	`extra_characters` text,
	`team_id` text,
	`custom_team_name` text,
	`team_position` integer,
	`published` integer DEFAULT false NOT NULL,
	`views` integer DEFAULT 0,
	`likes` integer DEFAULT 0,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`theme` text DEFAULT 'system',
	`email_notifications` integer DEFAULT true,
	`public_profile` integer DEFAULT false,
	`preferences` text,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`discord_id` text NOT NULL,
	`username` text NOT NULL,
	`discriminator` text,
	`avatar` text,
	`email` text,
	`created_at` integer,
	`updated_at` integer,
	`last_login_at` integer
);
--> statement-breakpoint
CREATE INDEX `likes_user_ranger_idx` ON `custom_ranger_likes` (`user_id`,`custom_ranger_id`);--> statement-breakpoint
CREATE INDEX `custom_rangers_user_id_idx` ON `custom_rangers` (`user_id`);--> statement-breakpoint
CREATE INDEX `custom_rangers_slug_idx` ON `custom_rangers` (`slug`);--> statement-breakpoint
CREATE INDEX `custom_rangers_published_idx` ON `custom_rangers` (`published`);--> statement-breakpoint
CREATE INDEX `custom_rangers_color_idx` ON `custom_rangers` (`color`);--> statement-breakpoint
CREATE INDEX `custom_rangers_type_idx` ON `custom_rangers` (`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `session_token_idx` ON `sessions` (`token`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_settings_user_id_unique` ON `user_settings` (`user_id`);--> statement-breakpoint
CREATE INDEX `user_settings_user_id_idx` ON `user_settings` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_discord_id_unique` ON `users` (`discord_id`);--> statement-breakpoint
CREATE INDEX `discord_id_idx` ON `users` (`discord_id`);--> statement-breakpoint
CREATE INDEX `username_idx` ON `users` (`username`);
CREATE TABLE `custom_ranger_comment_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`comment_id`) REFERENCES `custom_ranger_comments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `custom_ranger_comments` (
	`id` text PRIMARY KEY NOT NULL,
	`custom_ranger_id` text NOT NULL,
	`user_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`custom_ranger_id`) REFERENCES `custom_rangers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comment_likes_user_comment_idx` ON `custom_ranger_comment_likes` (`user_id`,`comment_id`);--> statement-breakpoint
CREATE INDEX `comments_ranger_id_idx` ON `custom_ranger_comments` (`custom_ranger_id`);--> statement-breakpoint
CREATE INDEX `comments_user_id_idx` ON `custom_ranger_comments` (`user_id`);--> statement-breakpoint
CREATE INDEX `comments_created_at_idx` ON `custom_ranger_comments` (`created_at`);
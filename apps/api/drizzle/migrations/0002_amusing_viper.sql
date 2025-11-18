CREATE TABLE `custom_ranger_notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`custom_ranger_id` text NOT NULL,
	`related_id` text,
	`actor_id` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`custom_ranger_id`) REFERENCES `custom_rangers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `notifications_user_id_idx` ON `custom_ranger_notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_ranger_id_idx` ON `custom_ranger_notifications` (`custom_ranger_id`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `custom_ranger_notifications` (`read`);--> statement-breakpoint
CREATE INDEX `notifications_created_at_idx` ON `custom_ranger_notifications` (`created_at`);
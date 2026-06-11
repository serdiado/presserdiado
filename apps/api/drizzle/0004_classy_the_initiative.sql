CREATE TABLE `user_billing_profiles` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('individual','corporate') NOT NULL DEFAULT 'corporate',
	`title` varchar(255) NOT NULL,
	`tax_office` varchar(150),
	`tax_number` varchar(20),
	`id_number` varchar(11),
	`invoice_address` text NOT NULL,
	`shipping_address` text NOT NULL,
	`is_default` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_billing_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `user_billing_profiles` ADD CONSTRAINT `user_billing_profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
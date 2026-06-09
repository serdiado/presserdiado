CREATE TABLE `media_assets` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('logo','background','shape','other') NOT NULL,
	`image_key` varchar(500) NOT NULL,
	`file_name` varchar(255),
	`mime_type` varchar(100),
	`size` int,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`sku` varchar(100) NOT NULL,
	`image_key` varchar(500) NOT NULL,
	`file_name` varchar(255),
	`sort_order` int NOT NULL DEFAULT 1,
	`is_transparent` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `sku` varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `unit` varchar(50);--> statement-breakpoint
ALTER TABLE `products` MODIFY COLUMN `category` varchar(100);--> statement-breakpoint
ALTER TABLE `products` ADD `description` text;--> statement-breakpoint
ALTER TABLE `products` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_user_id_sku_unique` UNIQUE(`user_id`,`sku`);--> statement-breakpoint
ALTER TABLE `media_assets` ADD CONSTRAINT `media_assets_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `media_assets_user_id_type_idx` ON `media_assets` (`user_id`,`type`);--> statement-breakpoint
CREATE INDEX `product_images_user_id_sku_idx` ON `product_images` (`user_id`,`sku`);
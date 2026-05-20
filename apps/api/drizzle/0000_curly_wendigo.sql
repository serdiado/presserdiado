CREATE TABLE `orders` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`project_id` varchar(36) NOT NULL,
	`print_config` json NOT NULL,
	`quantity` int NOT NULL,
	`unit_price` decimal(10,2),
	`total_price` decimal(10,2),
	`commission_rate` decimal(4,2),
	`commission_amount` decimal(10,2),
	`status` varchar(30) NOT NULL DEFAULT 'pending',
	`printer_id` varchar(36),
	`export_pdf_key` varchar(500),
	`payment_ref` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `printers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`api_endpoint` varchar(500),
	`capabilities` json DEFAULT ('{}'),
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `printers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_types` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`category` varchar(100),
	`dimensions` json NOT NULL,
	`bleed_mm` decimal(4,1) NOT NULL DEFAULT '3.0',
	`default_grid` json NOT NULL DEFAULT ('{"cols":4,"rows":4}'),
	`config_schema` json NOT NULL,
	`base_price_table` json,
	`active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	CONSTRAINT `product_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `product_types_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`sku` varchar(100),
	`name` varchar(500) NOT NULL,
	`price` decimal(10,2),
	`original_price` decimal(10,2),
	`currency` varchar(3) NOT NULL DEFAULT 'TRY',
	`unit` varchar(20),
	`badge` varchar(100),
	`image_key` varchar(500),
	`image_thumb_key` varchar(500),
	`category` varchar(255),
	`metadata` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(500) NOT NULL,
	`product_type_id` varchar(36) NOT NULL,
	`status` varchar(20) NOT NULL DEFAULT 'draft',
	`canvas_data` json NOT NULL,
	`thumbnail_key` varchar(500),
	`print_config` json DEFAULT ('{}'),
	`auto_saved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_templates` (
	`id` varchar(36) NOT NULL,
	`product_type_id` varchar(36) NOT NULL,
	`name` varchar(500) NOT NULL,
	`thumbnail_key` varchar(500),
	`canvas_data` json NOT NULL,
	`category` varchar(100),
	`sort_order` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	CONSTRAINT `system_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_modules` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` varchar(500) NOT NULL,
	`type` varchar(20) NOT NULL,
	`module_data` json NOT NULL,
	`thumbnail_key` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_modules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`company_name` varchar(255),
	`default_print_prefs` json DEFAULT ('{}'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_printer_id_printers_id_fk` FOREIGN KEY (`printer_id`) REFERENCES `printers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `products` ADD CONSTRAINT `products_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `projects` ADD CONSTRAINT `projects_product_type_id_product_types_id_fk` FOREIGN KEY (`product_type_id`) REFERENCES `product_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `system_templates` ADD CONSTRAINT `system_templates_product_type_id_product_types_id_fk` FOREIGN KEY (`product_type_id`) REFERENCES `product_types`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_modules` ADD CONSTRAINT `user_modules_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;
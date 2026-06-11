CREATE TABLE `order_items` (
	`id` varchar(36) NOT NULL,
	`order_id` varchar(36) NOT NULL,
	`project_id` varchar(36),
	`item_type` enum('studio_design','uploaded_file') NOT NULL DEFAULT 'studio_design',
	`product_type_key` varchar(100),
	`quantity` int NOT NULL DEFAULT 1,
	`size` varchar(50),
	`fold_type` varchar(50),
	`paper_type` varchar(100),
	`paper_weight` varchar(50),
	`color_mode` varchar(50),
	`coating` varchar(100),
	`binding` varchar(100),
	`print_options` json,
	`unit_price` decimal(10,2) NOT NULL,
	`line_total` decimal(10,2) NOT NULL,
	`production_pdf_key` varchar(500),
	`preview_image_key` varchar(500),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint
CREATE TABLE `pricing_rules` (
	`id` varchar(36) NOT NULL,
	`product_type_id` varchar(36) NOT NULL,
	`size_key` varchar(100),
	`paper_type_key` varchar(100),
	`paper_weight_key` varchar(100),
	`color_mode_key` varchar(100),
	`coating_key` varchar(100),
	`binding_key` varchar(100),
	`base_price` decimal(10,2) NOT NULL,
	`setup_fee` decimal(10,2) NOT NULL DEFAULT '0',
	`quantity_tiers` json,
	`tax_rate` decimal(5,2) NOT NULL DEFAULT '20.00',
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pricing_rules_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint
CREATE TABLE `print_options` (
	`id` varchar(36) NOT NULL,
	`product_type_id` varchar(36) NOT NULL,
	`category` enum('size','fold','paper_type','paper_weight','color_mode','coating','binding') NOT NULL,
	`key` varchar(100) NOT NULL,
	`label` varchar(255) NOT NULL,
	`affects_design` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`is_active` boolean NOT NULL DEFAULT true,
	`sort_order` int NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `print_options_id` PRIMARY KEY(`id`)
);

--> statement-breakpoint
ALTER TABLE `orders` DROP FOREIGN KEY `orders_project_id_projects_id_fk`;

--> statement-breakpoint
ALTER TABLE `orders` DROP FOREIGN KEY `orders_printer_id_printers_id_fk`;

--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `status` enum('draft','submitted','in_production','shipped','completed','cancelled') NOT NULL DEFAULT 'submitted';
--> statement-breakpoint
ALTER TABLE `orders` ADD `order_number` varchar(50) NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `payment_status` enum('none','pending','paid','refunded') DEFAULT 'none' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `billing_profile_id` varchar(36);
--> statement-breakpoint
ALTER TABLE `orders` ADD `billing_snapshot` json;
--> statement-breakpoint
ALTER TABLE `orders` ADD `subtotal` decimal(10,2) NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `discount_total` decimal(10,2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `tax_total` decimal(10,2) DEFAULT '0' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `grand_total` decimal(10,2) NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `currency` varchar(3) DEFAULT 'TRY' NOT NULL;
--> statement-breakpoint
ALTER TABLE `orders` ADD `notes` text;
--> statement-breakpoint
ALTER TABLE `product_types` ADD `created_at` timestamp DEFAULT (now()) NOT NULL;
--> statement-breakpoint
ALTER TABLE `product_types` ADD `updated_at` timestamp DEFAULT (now()) NOT NULL ON UPDATE CURRENT_TIMESTAMP;
--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_order_number_unique` UNIQUE(`order_number`);
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_orders_id_fk` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_project_id_projects_id_fk` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `pricing_rules` ADD CONSTRAINT `pricing_rules_product_type_id_product_types_id_fk` FOREIGN KEY (`product_type_id`) REFERENCES `product_types`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE `print_options` ADD CONSTRAINT `print_options_product_type_id_product_types_id_fk` FOREIGN KEY (`product_type_id`) REFERENCES `product_types`(`id`) ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);
--> statement-breakpoint
CREATE INDEX `order_items_project_id_idx` ON `order_items` (`project_id`);
--> statement-breakpoint
CREATE INDEX `pricing_rules_product_type_id_is_active_idx` ON `pricing_rules` (`product_type_id`,`is_active`);
--> statement-breakpoint
CREATE INDEX `print_options_product_type_id_category_is_active_idx` ON `print_options` (`product_type_id`,`category`,`is_active`);
--> statement-breakpoint
CREATE INDEX `orders_user_id_created_at_idx` ON `orders` (`user_id`,`created_at`);
--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `project_id`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `print_config`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `quantity`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `unit_price`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `total_price`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `commission_rate`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `commission_amount`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `printer_id`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `export_pdf_key`;
--> statement-breakpoint
ALTER TABLE `orders` DROP COLUMN `payment_ref`;

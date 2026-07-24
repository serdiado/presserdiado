ALTER TABLE `pricing_rules` ADD `quantity` int;--> statement-breakpoint
ALTER TABLE `product_types` ADD `sale_mode` enum('design','upload','quote') DEFAULT 'design' NOT NULL;--> statement-breakpoint
ALTER TABLE `product_types` ADD `description` varchar(500);
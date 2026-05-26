CREATE TABLE `theme_configs` (
	`id` varchar(36) NOT NULL,
	`mode` varchar(5) NOT NULL,
	`tokens` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `theme_configs_id` PRIMARY KEY(`id`),
	CONSTRAINT `theme_configs_mode_unique` UNIQUE(`mode`)
);

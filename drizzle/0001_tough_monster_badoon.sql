CREATE TABLE `roadmap_node_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`node_id` integer NOT NULL,
	`label` text NOT NULL,
	`url` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`node_id`) REFERENCES `roadmap_nodes`(`id`) ON UPDATE no action ON DELETE cascade
);

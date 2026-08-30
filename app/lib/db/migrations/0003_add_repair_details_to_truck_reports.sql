ALTER TABLE `truckReports` ADD `repaired_by_user_id` integer REFERENCES `user`(`id`);
--> statement-breakpoint
ALTER TABLE `truckReports` ADD `repaired_by` text;
--> statement-breakpoint
ALTER TABLE `truckReports` ADD `repaired_at` integer;
--> statement-breakpoint
ALTER TABLE `truckReports` ADD `repair_cost_cents` integer;

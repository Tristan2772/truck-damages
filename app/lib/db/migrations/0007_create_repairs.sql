CREATE TABLE `repairs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `report_id` integer NOT NULL REFERENCES `truckReports`(`id`) ON DELETE cascade,
  `repaired_by_user_id` integer REFERENCES `user`(`id`),
  `repaired_by` text NOT NULL,
  `repaired_at` integer NOT NULL,
  `repair_cost_cents` integer NOT NULL,
  `description` text,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `repairs_report_id_repaired_at_index` ON `repairs` (`report_id`, `repaired_at` DESC);
--> statement-breakpoint
INSERT INTO `repairs` (
  `report_id`,
  `repaired_by_user_id`,
  `repaired_by`,
  `repaired_at`,
  `repair_cost_cents`,
  `created_at`,
  `updated_at`
)
SELECT
  `id`,
  `repaired_by_user_id`,
  COALESCE(`repaired_by`, 'Not provided'),
  `repaired_at`,
  COALESCE(`repair_cost_cents`, 0),
  `repaired_at`,
  `repaired_at`
FROM `truckReports`
WHERE `repaired_at` IS NOT NULL;
--> statement-breakpoint
ALTER TABLE `truckReports` DROP COLUMN `repaired_by_user_id`;
--> statement-breakpoint
ALTER TABLE `truckReports` DROP COLUMN `repaired_by`;
--> statement-breakpoint
ALTER TABLE `truckReports` DROP COLUMN `repaired_at`;
--> statement-breakpoint
ALTER TABLE `truckReports` DROP COLUMN `repair_cost_cents`;

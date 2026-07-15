import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import { user } from "./auth";
import { truckReports } from "./truck-reports";

export const truckReportImages = sqliteTable("truckReportImages", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull(),
  description: text(),
  truckReportId: int().notNull().references(() => truckReports.id, { onDelete: "cascade" }),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const TruckReportsImageRelations = relations(truckReportImages, ({ one }) => ({
  truckReport: one(truckReports, {
    fields: [truckReportImages.truckReportId],
    references: [truckReports.id],
  }),
}));

export const InsertTruckReportImage = createInsertSchema(truckReportImages, {
  key: field => field.regex(/^\d+\/\d+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/, "Invalid Key"),
  description: z.string().max(1000).optional().nullable(),
}).omit({
  id: true,
  truckReportId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTruckReportImage = z.infer<typeof InsertTruckReportImage>;
export type SelectTruckReportImage = typeof truckReportImages.$inferSelect;

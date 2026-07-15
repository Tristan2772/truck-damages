import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import type { SelectTruckReportImage } from "./truck-report-images";

import { user } from "./auth";
import { truckReportImages } from "./truck-report-images";
import { trucks } from "./trucks";

export const truckReports = sqliteTable("truckReports", {
  id: int().primaryKey({ autoIncrement: true }),
  description: text(),
  truckId: int().notNull().references(() => trucks.id, { onDelete: "cascade" }),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const InsertTruckReport = createInsertSchema(truckReports, {
  description: z.string().max(1000).optional().nullable(),
}).omit({
  id: true,
  userId: true,
  truckId: true,
  createdAt: true,
  updatedAt: true,
});

export const TruckReportsRelations = relations(truckReports, ({ one, many }) => ({
  truck: one(trucks, {
    fields: [truckReports.truckId],
    references: [trucks.id],
  }),
  images: many(truckReportImages),
}));

export type SelectTruckReport = typeof truckReports.$inferSelect;
export type InsertTruckReport = z.infer<typeof InsertTruckReport>;
export type SelectTruckReportWithImages = SelectTruckReport & {
  images: SelectTruckReportImage[];
};

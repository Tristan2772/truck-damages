import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import z from "zod";

import type { SelectUser } from "./auth";
import type { SelectTruckReportImage } from "./truck-report-images";

import { user } from "./auth";
import { truckReportImages } from "./truck-report-images";
import { trucks } from "./trucks";

export const truckReports = sqliteTable("truckReports", {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  truckId: int().notNull().references(() => trucks.id, { onDelete: "cascade" }),
  truckVin: text().notNull(),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const InsertTruckReport = createInsertSchema(truckReports, {
  name: z.string().min(1).max(100),
  description: z.string().max(1000).optional().nullable(),
  truckVin: z.string().min(17).max(17),
}).omit({
  id: true,
  userId: true,
  truckId: true,
  createdAt: true,
  updatedAt: true,
});

export const TruckReportsRelations = relations(truckReports, ({ one, many }) => ({
  user: one(user, {
    fields: [truckReports.userId],
    references: [user.id],
  }),
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
  user: SelectUser;
};

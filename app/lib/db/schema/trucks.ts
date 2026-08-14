import { relations } from "drizzle-orm";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { SelectTruckReport, SelectTruckReportWithImages } from "./truck-reports";

import { user } from "./auth";
import { truckReports } from "./truck-reports";

export const trucks = sqliteTable("trucks", {
  id: int().primaryKey({ autoIncrement: true }),
  vin: text().notNull(),
  name: text().notNull(),
  type: text().notNull(),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.vin),
  unique().on(t.name),
]);

export const InsertTruck = createInsertSchema(trucks, {
  name: z.string().min(1).max(100),
  type: z.string().min(1),
  vin: z.string().min(17).max(17),
}).pick({
  name: true,
  type: true,
  vin: true,
});

export const TrucksRelations = relations(trucks, ({ many }) => ({
  truckReports: many(truckReports),
}));

export type InsertTruck = z.infer<typeof InsertTruck>;
export type SelectTruck = typeof trucks.$inferSelect;
export type SelectTruckWithReports = SelectTruck & {
  truckReports: SelectTruckReport[];
};
export type SelectTruckWithReportsAndImages = SelectTruck & {
  truckReports: SelectTruckReportWithImages[];
};

import { relations } from "drizzle-orm";
import { int, sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

import type { SelectTruckReport } from "./truck-reports";

import { user } from "./auth";
import { truckReports } from "./truck-reports";

export const trucks = sqliteTable("trucks", {
  id: int().primaryKey({ autoIncrement: true }),
  vin: text().notNull(),
  name: text().notNull(),
  brand: text().notNull(),
  userId: int().notNull().references(() => user.id, { onDelete: "cascade" }),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
}, t => [
  unique().on(t.vin),
]);

export const InsertTruck = createInsertSchema(trucks, {
  name: z.string().min(1).max(20),
  brand: z.string(),
  vin: z.string(),
}).pick({
  name: true,
  brand: true,
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

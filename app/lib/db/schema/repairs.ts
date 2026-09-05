import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { user } from "./auth";
import { truckReports } from "./truck-reports";

export const repairs = sqliteTable("repairs", {
  id: int().primaryKey({ autoIncrement: true }),
  reportId: int().notNull().references(() => truckReports.id, { onDelete: "cascade" }),
  repairedByUserId: int().references(() => user.id),
  repairedBy: text().notNull(),
  repairedAt: int().notNull(),
  repairCostCents: int().notNull(),
  description: text(),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const RepairsRelations = relations(repairs, ({ one }) => ({
  report: one(truckReports, {
    fields: [repairs.reportId],
    references: [truckReports.id],
  }),
  repairedUser: one(user, {
    fields: [repairs.repairedByUserId],
    references: [user.id],
  }),
}));

export type SelectRepair = typeof repairs.$inferSelect;

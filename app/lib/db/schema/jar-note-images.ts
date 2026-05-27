import type z from "zod";

import { relations } from "drizzle-orm";
import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";

import { user } from "./auth";
import { jarNotes } from "./jar-notes";

export const jarNoteImages = sqliteTable("jarNoteImages", {
  id: int().primaryKey({ autoIncrement: true }),
  key: text().notNull(),
  jarNoteId: int().notNull().references(() => jarNotes.id),
  userId: int().notNull().references(() => user.id),
  createdAt: int().notNull().$default(() => Date.now()),
  updatedAt: int().notNull().$default(() => Date.now()).$onUpdate(() => Date.now()),
});

export const JarNotesImageRelations = relations(jarNoteImages, ({ one }) => ({
  jarNote: one(jarNotes, {
    fields: [jarNoteImages.jarNoteId],
    references: [jarNotes.id],
  }),
}));

export const InsertJarNoteImage = createInsertSchema(jarNoteImages, {
  key: field => field.regex(/^\d+\/\d+\/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/, "Invalid Key"),
}).omit({
  id: true,
  jarNoteId: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertJarNoteImage = z.infer<typeof InsertJarNoteImage>;
export type SelectJarNoteImage = typeof jarNoteImages.$inferSelect;

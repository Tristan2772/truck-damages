import { and, eq } from "drizzle-orm";

import type { InsertJarNoteImage } from "../schema";

import db from "..";
import { jarNoteImages } from "../schema";

export async function insertJarNoteImage(
  jarNoteId: number,
  insertable: InsertJarNoteImage,
  userId: number,
) {
  const [inserted] = await db.insert(jarNoteImages).values({
    ...insertable,
    userId,
    jarNoteId,
  }).returning();

  return inserted;
}

export async function deleteJarNoteImage(imageId: number, userId: number) {
  const [deleted] = await db.delete(jarNoteImages).where(
    and(
      eq(jarNoteImages.id, imageId),
      eq(jarNoteImages.userId, userId),
    ),
  ).returning();
  return deleted;
}

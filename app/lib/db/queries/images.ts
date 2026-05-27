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

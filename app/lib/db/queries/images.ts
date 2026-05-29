import { and, eq } from "drizzle-orm";

import type { InsertJarNoteImage } from "../schema";

import db from "..";
import { jarNoteImages, jarNotes, jars } from "../schema";

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

export async function findJarNoteImageById(imageId: number, userId: number) {
  return db.query.jarNoteImages.findFirst({
    where: and(
      eq(jarNoteImages.id, imageId),
      eq(jarNoteImages.userId, userId),
    ),
  });
}

export async function findJarNoteImageKeysByNoteId(noteId: number, userId: number) {
  const rows = await db.select({
    key: jarNoteImages.key,
  }).from(jarNoteImages).innerJoin(
    jarNotes,
    eq(jarNoteImages.jarNoteId, jarNotes.id),
  ).where(and(
    eq(jarNotes.id, noteId),
    eq(jarNotes.userId, userId),
    eq(jarNoteImages.userId, userId),
  ));

  return rows.map(row => row.key);
}

export async function findJarNoteImageKeysByJarSlug(slug: string, userId: number) {
  const rows = await db.select({
    key: jarNoteImages.key,
  }).from(jarNoteImages).innerJoin(
    jarNotes,
    eq(jarNoteImages.jarNoteId, jarNotes.id),
  ).innerJoin(
    jars,
    eq(jarNotes.jarId, jars.id),
  ).where(and(
    eq(jars.slug, slug),
    eq(jars.userId, userId),
    eq(jarNotes.userId, userId),
    eq(jarNoteImages.userId, userId),
  ));

  return rows.map(row => row.key);
}

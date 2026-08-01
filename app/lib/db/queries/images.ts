import { and, eq } from "drizzle-orm";

import type { InsertTruckReportImage } from "../schema";

import db from "..";
import { truckReportImages, truckReports, trucks } from "../schema";

export async function insertTruckReportImage(
  truckReportId: number,
  insertable: InsertTruckReportImage,
  userId: number,
) {
  const [inserted] = await db.insert(truckReportImages).values({
    ...insertable,
    userId,
    truckReportId,
  }).returning();

  return inserted;
}

export async function deleteTruckReportImage(imageId: number, userId?: number) {
  const conditions = [
    eq(truckReportImages.id, imageId),
  ];

  if (userId) {
    conditions.push(eq(truckReportImages.userId, userId));
  }

  const [deleted] = await db.delete(truckReportImages).where(
    and(...conditions),
  ).returning();
  return deleted;
}

export async function findTruckReportImageById(imageId: number, userId?: number) {
  const conditions = [
    eq(truckReportImages.id, imageId),
  ];

  if (userId) {
    conditions.push(eq(truckReportImages.userId, userId));
  }

  return db.query.truckReportImages.findFirst({
    where: and(...conditions),
  });
}

export async function findTruckReportImageKeysByReportId(reportId: number, userId?: number) {
  const conditions = [
    eq(truckReports.id, reportId),
  ];

  if (userId) {
    conditions.push(eq(truckReports.userId, userId));
    conditions.push(eq(truckReportImages.userId, userId));
  }

  const rows = await db.select({
    key: truckReportImages.key,
  }).from(truckReportImages).innerJoin(
    truckReports,
    eq(truckReportImages.truckReportId, truckReports.id),
  ).where(and(
    ...conditions,
  ));

  return rows.map(row => row.key);
}

export async function findTruckReportImageKeysByTruckVin(vin: string, userId?: number) {
  const conditions = [
    eq(trucks.vin, vin),
  ];

  if (userId) {
    conditions.push(eq(trucks.userId, userId));
    conditions.push(eq(truckReports.userId, userId));
    conditions.push(eq(truckReportImages.userId, userId));
  }

  const rows = await db.select({
    key: truckReportImages.key,
  }).from(truckReportImages).innerJoin(
    truckReports,
    eq(truckReportImages.truckReportId, truckReports.id),
  ).innerJoin(
    trucks,
    eq(truckReports.truckId, trucks.id),
  ).where(and(
    ...conditions,
  ));

  return rows.map(row => row.key);
}

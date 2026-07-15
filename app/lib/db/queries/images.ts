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

export async function deleteTruckReportImage(imageId: number, userId: number) {
  const [deleted] = await db.delete(truckReportImages).where(
    and(
      eq(truckReportImages.id, imageId),
      eq(truckReportImages.userId, userId),
    ),
  ).returning();
  return deleted;
}

export async function findTruckReportImageById(imageId: number, userId: number) {
  return db.query.truckReportImages.findFirst({
    where: and(
      eq(truckReportImages.id, imageId),
      eq(truckReportImages.userId, userId),
    ),
  });
}

export async function findTruckReportImageKeysByReportId(reportId: number, userId: number) {
  const rows = await db.select({
    key: truckReportImages.key,
  }).from(truckReportImages).innerJoin(
    truckReports,
    eq(truckReportImages.truckReportId, truckReports.id),
  ).where(and(
    eq(truckReports.id, reportId),
    eq(truckReports.userId, userId),
    eq(truckReportImages.userId, userId),
  ));

  return rows.map(row => row.key);
}

export async function findTruckReportImageKeysByTruckVin(vin: string, userId: number) {
  const rows = await db.select({
    key: truckReportImages.key,
  }).from(truckReportImages).innerJoin(
    truckReports,
    eq(truckReportImages.truckReportId, truckReports.id),
  ).innerJoin(
    trucks,
    eq(truckReports.truckId, trucks.id),
  ).where(and(
    eq(trucks.vin, vin),
    eq(trucks.userId, userId),
    eq(truckReports.userId, userId),
    eq(truckReportImages.userId, userId),
  ));

  return rows.map(row => row.key);
}

import { and, eq } from "drizzle-orm";

import type { InsertTruckReport } from "../schema";

import db from "..";
import { truckReports } from "../schema";

export async function insertTruckReport(truckId: number, insertable: InsertTruckReport, userId: number) {
  const [inserted] = await db.insert(truckReports).values({
    ...insertable,
    truckId,
    userId,
  }).returning();

  return inserted;
}

export async function findReport(reportId: number, userId: number) {
  return db.query.truckReports.findFirst({
    where: and(
      eq(truckReports.id, reportId),
      eq(truckReports.userId, userId),
    ),
    with: {
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });
}

export async function findReportByName(existing: InsertTruckReport, userId: number) {
  return db.query.truckReports.findFirst({
    where: and(
      eq(truckReports.name, existing.name),
      eq(truckReports.userId, userId),
    ),
  });
}

export async function updateReportById(updates: InsertTruckReport, reportId: number, userId: number) {
  const [updated] = await db.update(truckReports).set(updates).where(and(
    eq(truckReports.id, reportId),
    eq(truckReports.userId, userId),
  )).returning();
  return updated;
}

export async function removeReportById(reportId: number, userId: number) {
  const [deleted] = await db.delete(truckReports).where(
    and(
      eq(truckReports.id, reportId),
      eq(truckReports.userId, userId),
    ),
  ).returning();
  return deleted;
}

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

export async function findReport(reportId: number) {
  return db.query.truckReports.findFirst({
    where: and(
      eq(truckReports.id, reportId),
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
  const conditions = [
    eq(truckReports.name, existing.name),
  ];

  if (userId) {
    conditions.push(eq(truckReports.userId, userId));
  }

  return db.query.truckReports.findFirst({
    where: and(...conditions),
  });
}

export async function updateReportById(updates: InsertTruckReport, reportId: number, userId?: number) {
  const conditions = [
    eq(truckReports.id, reportId),
  ];

  if (userId) {
    conditions.push(eq(truckReports.userId, userId));
  }

  const [updated] = await db.update(truckReports).set(updates).where(and(...conditions)).returning();
  return updated;
}

export async function removeReportById(reportId: number, userId?: number) {
  const conditions = [
    eq(truckReports.id, reportId),
  ];

  if (userId) {
    conditions.push(eq(truckReports.userId, userId));
  }

  const [deleted] = await db.delete(truckReports).where(
    and(...conditions),
  ).returning();
  return deleted;
}

export async function findReportsByUserId(userId: number) {
  return db.query.truckReports.findMany({
    where: eq(truckReports.userId, userId),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });
}

import { and, eq } from "drizzle-orm";

import type { InsertRepair, InsertTruckReport } from "../schema";

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
      user: true,
      assignedUser: true,
      repairedUser: true,
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

export async function markReportRepaired(repair: InsertRepair, reportId: number, repairedByUserId: number) {
  const [updated] = await db.update(truckReports).set({
    repairedByUserId,
    repairedBy: repair.repairedBy,
    repairedAt: repair.repairedAt,
    repairCostCents: Math.round(repair.repairCost * 100),
    ...(repair.ungroundTruck ? { isGrounded: false } : {}),
  }).where(eq(truckReports.id, reportId)).returning();

  return updated;
}

export async function removeReportRepair(reportId: number) {
  const [updated] = await db.update(truckReports).set({
    repairedByUserId: null,
    repairedBy: null,
    repairedAt: null,
    repairCostCents: null,
  }).where(eq(truckReports.id, reportId)).returning();

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
      user: true,
      assignedUser: true,
      repairedUser: true,
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });
}

export async function findReportsAssignedToUserId(userId: number) {
  return db.query.truckReports.findMany({
    where: eq(truckReports.assignedTo, userId),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      user: true,
      assignedUser: true,
      repairedUser: true,
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });
}

export async function findAllReports() {
  return db.query.truckReports.findMany({
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      user: true,
      assignedUser: true,
      repairedUser: true,
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });
}

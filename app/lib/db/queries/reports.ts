import { and, desc, eq, inArray } from "drizzle-orm";

import type { InsertRepair, InsertTruckReport } from "../schema";

import db from "..";
import { repairs, truckReports, trucks } from "../schema";

function activeTruckReportIds() {
  return db.select({ id: truckReports.id }).from(truckReports).innerJoin(
    trucks,
    eq(truckReports.truckId, trucks.id),
  ).where(eq(trucks.archivedAt, 0));
}

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
      truck: true,
      user: true,
      assignedUser: true,
      repairs: {
        orderBy: [desc(repairs.repairedAt), desc(repairs.id)],
        with: {
          repairedUser: true,
        },
      },
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

export async function insertRepair(repair: InsertRepair, reportId: number, repairedByUserId: number) {
  const [inserted] = await db.insert(repairs).values({
    reportId,
    repairedByUserId,
    repairedBy: repair.repairedBy,
    repairedAt: repair.repairedAt,
    repairCostCents: Math.round(repair.repairCost * 100),
    description: repair.description || null,
  }).returning();

  if (repair.ungroundTruck) {
    await db.update(truckReports).set({ isGrounded: false }).where(eq(truckReports.id, reportId));
  }

  return inserted;
}

export async function findRepairsByReportId(reportId: number) {
  return db.query.repairs.findMany({
    where: eq(repairs.reportId, reportId),
    orderBy: [desc(repairs.repairedAt), desc(repairs.id)],
    with: {
      repairedUser: true,
    },
  });
}

export async function findRepairById(repairId: number, reportId: number) {
  return db.query.repairs.findFirst({
    where: and(eq(repairs.id, repairId), eq(repairs.reportId, reportId)),
    with: {
      repairedUser: true,
    },
  });
}

export async function updateRepair(repair: InsertRepair, repairId: number, reportId: number) {
  const [updated] = await db.update(repairs).set({
    repairedBy: repair.repairedBy,
    repairedAt: repair.repairedAt,
    repairCostCents: Math.round(repair.repairCost * 100),
    description: repair.description || null,
  }).where(and(eq(repairs.id, repairId), eq(repairs.reportId, reportId))).returning();

  if (repair.ungroundTruck) {
    await db.update(truckReports).set({ isGrounded: false }).where(eq(truckReports.id, reportId));
  }

  return updated;
}

export async function removeRepair(repairId: number, reportId: number) {
  const [deleted] = await db.delete(repairs).where(
    and(eq(repairs.id, repairId), eq(repairs.reportId, reportId)),
  ).returning();

  return deleted;
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

export async function findReportsByUserId(userId: number, includeArchivedTrucks = false) {
  return db.query.truckReports.findMany({
    where: includeArchivedTrucks
      ? eq(truckReports.userId, userId)
      : and(
          eq(truckReports.userId, userId),
          inArray(truckReports.id, activeTruckReportIds()),
        ),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      truck: true,
      user: true,
      assignedUser: true,
      repairs: true,
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
      truck: true,
      user: true,
      assignedUser: true,
      repairs: true,
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
    where: inArray(truckReports.id, activeTruckReportIds()),
    orderBy(fields, operators) {
      return operators.desc(fields.createdAt);
    },
    with: {
      truck: true,
      user: true,
      assignedUser: true,
      repairs: true,
      images: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
      },
    },
  });
}

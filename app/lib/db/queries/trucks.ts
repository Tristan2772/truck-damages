import { and, asc, eq, like, or } from "drizzle-orm";

import type { InsertTruck } from "../schema";

import db from "..";
import { truckReports, trucks } from "../schema";

export type HeaderSearchResult = {
  type: "truck" | "report";
  vin: string;
  truckName: string;
  reportId: number | null;
  reportName: string | null;
  reportDescription: string | null;
};

export async function findTruck(vin: string) {
  return db.query.trucks.findFirst({
    where:
      eq(trucks.vin, vin),
    with: {
      truckReports: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
        with: {
          user: true,
          images: {
            orderBy(fields, operators) {
              return operators.desc(fields.createdAt);
            },
          },
        },
      },
    },
  });
}

export async function findAllTrucks() {
  return db.query.trucks.findMany({
    with: {
      truckReports: {
        orderBy(fields, operators) {
          return operators.desc(fields.createdAt);
        },
        with: {
          user: true,
          images: {
            orderBy(fields, operators) {
              return operators.desc(fields.createdAt);
            },
          },
        },
      },
    },
  });
}

export async function searchHeaderMatches(searchTerm: string, limit = 8): Promise<HeaderSearchResult[]> {
  const trimmedSearchTerm = searchTerm.trim();

  if (!trimmedSearchTerm) {
    return [];
  }

  const normalizedSearchTerm = trimmedSearchTerm.toLowerCase();
  const match = `%${trimmedSearchTerm}%`;
  const rows = await db.select({
    vin: trucks.vin,
    truckName: trucks.name,
    reportId: truckReports.id,
    reportName: truckReports.name,
    reportDescription: truckReports.description,
  }).from(trucks).leftJoin(
    truckReports,
    eq(truckReports.truckId, trucks.id),
  ).where(or(
    like(trucks.vin, match),
    like(trucks.name, match),
    like(truckReports.name, match),
    like(truckReports.description, match),
  )).orderBy(
    asc(trucks.name),
    asc(truckReports.name),
    asc(trucks.vin),
  ).limit(limit * 3);

  const results: HeaderSearchResult[] = [];
  const seenTruckVins = new Set<string>();
  const seenReportIds = new Set<number>();

  for (const row of rows) {
    const truckMatches = row.vin.toLowerCase().includes(normalizedSearchTerm) || row.truckName.toLowerCase().includes(normalizedSearchTerm);
    if (truckMatches && !seenTruckVins.has(row.vin)) {
      seenTruckVins.add(row.vin);
      results.push({
        type: "truck",
        vin: row.vin,
        truckName: row.truckName,
        reportId: null,
        reportName: null,
        reportDescription: null,
      });
    }

    if (row.reportId !== null && !seenReportIds.has(row.reportId)) {
      const description = row.reportDescription || "";
      const reportMatches = row.reportName?.toLowerCase().includes(normalizedSearchTerm) || description.toLowerCase().includes(normalizedSearchTerm) || row.vin.toLowerCase().includes(normalizedSearchTerm);

      if (reportMatches) {
        seenReportIds.add(row.reportId);
        results.push({
          type: "report",
          vin: row.vin,
          truckName: row.truckName,
          reportId: row.reportId,
          reportName: row.reportName,
          reportDescription: row.reportDescription,
        });
      }
    }

    if (results.length >= limit) {
      break;
    }
  }

  return results;
}

export async function findTruckByName(name: string) {
  return db.query.trucks.findFirst({
    where: eq(trucks.name, name),
  });
}

export async function findTruckByVin(vin: string) {
  return db.query.trucks.findFirst({
    where: eq(trucks.vin, vin),
  });
}

export async function insertTruck(insertable: InsertTruck, vin: string, userId: number) {
  const [created] = await db.insert(trucks).values({
    ...insertable,
    vin,
    userId,
  }).returning();
  return created;
}

export async function updateTruckByVin(updates: InsertTruck, vin: string, userId?: number) {
  const conditions = [
    eq(trucks.vin, vin),
  ];

  if (userId) {
    conditions.push(eq(trucks.userId, userId));
  }

  const [updated] = await db.update(trucks).set(updates).where(and(...conditions)).returning();
  return updated;
}

export async function removeTruckByVin(vin: string, userId?: number) {
  const conditions = [
    eq(trucks.vin, vin),
  ];

  if (userId) {
    conditions.push(eq(trucks.userId, userId));
  }

  const [deleted] = await db.delete(trucks).where(and(...conditions)).returning();
  return deleted;
}

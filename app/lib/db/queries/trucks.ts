import { and, eq } from "drizzle-orm";

import type { InsertTruck } from "../schema";

import db from "..";
import { trucks } from "../schema";

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

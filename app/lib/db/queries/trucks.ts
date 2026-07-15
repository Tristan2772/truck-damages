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
      },
    },
  });
}

export async function findAllTrucks(userId: number) {
  return db.query.trucks.findMany({
    where: eq(trucks.userId, userId),
  });
}

export async function findTruckByName(existing: InsertTruck) {
  return db.query.trucks.findFirst({
    where:
      eq(trucks.name, existing.name),
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

export async function updateTruckByVin(updates: InsertTruck, vin: string, userId: number) {
  const [updated] = await db.update(trucks).set(updates).where(and(
    eq(trucks.vin, vin),
    eq(trucks.userId, userId),
  )).returning();
  return updated;
}

export async function removeTruckByVin(vin: string, userId: number) {
  const [deleted] = await db.delete(trucks).where(and(
    eq(trucks.vin, vin),
    eq(trucks.userId, userId),
  )).returning();
  return deleted;
}

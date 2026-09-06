import { asc, count, desc, eq, gt, like, max, or, sql } from "drizzle-orm";

import db from "..";
import { repairs, truckReports, user } from "../schema";

export type UserSearchResult = Pick<typeof user.$inferSelect, "id" | "name" | "email" | "archivedAt">;
export type UserWithReportCount = UserSearchResult & {
  amount: number;
  latestReportAt: number | null;
  repairedReportCount: number;
  unrepairedReportCount: number;
  assignedReportCount: number;
  unassignedReportCount: number;
};
export type UserReportMode = "created" | "assigned";

export async function findAllUsers(mode: UserReportMode = "created"): Promise<UserWithReportCount[]> {
  const rows = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    archivedAt: user.archivedAt,
    amount: count(truckReports.id),
    latestReportAt: max(truckReports.createdAt),
    repairedReportCount: sql<number>`count(case when exists (select 1 from ${repairs} where ${repairs.reportId} = ${truckReports.id}) then 1 end)`,
    unrepairedReportCount: sql<number>`count(case when ${truckReports.id} is not null and not exists (select 1 from ${repairs} where ${repairs.reportId} = ${truckReports.id}) then 1 end)`,
    assignedReportCount: sql<number>`count(case when ${truckReports.assignedTo} is not null then 1 end)`,
    unassignedReportCount: sql<number>`count(case when ${truckReports.id} is not null and ${truckReports.assignedTo} is null then 1 end)`,
  }).from(user).leftJoin(
    truckReports,
    eq(user.id, mode === "created" ? truckReports.userId : truckReports.assignedTo),
  ).where(eq(user.archivedAt, 0)).groupBy(user.id).orderBy(desc(max(truckReports.createdAt)), asc(user.email));

  return rows.map(row => ({
    ...row,
    amount: Number(row.amount),
    latestReportAt: row.latestReportAt === null ? null : Number(row.latestReportAt),
    repairedReportCount: Number(row.repairedReportCount),
    unrepairedReportCount: Number(row.unrepairedReportCount),
    assignedReportCount: Number(row.assignedReportCount),
    unassignedReportCount: Number(row.unassignedReportCount),
  }));
}

export async function findAllArchivedUsers(mode: UserReportMode = "created"): Promise<UserWithReportCount[]> {
  const rows = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    archivedAt: user.archivedAt,
    amount: count(truckReports.id),
    latestReportAt: max(truckReports.createdAt),
    repairedReportCount: sql<number>`count(case when exists (select 1 from ${repairs} where ${repairs.reportId} = ${truckReports.id}) then 1 end)`,
    unrepairedReportCount: sql<number>`count(case when ${truckReports.id} is not null and not exists (select 1 from ${repairs} where ${repairs.reportId} = ${truckReports.id}) then 1 end)`,
    assignedReportCount: sql<number>`count(case when ${truckReports.assignedTo} is not null then 1 end)`,
    unassignedReportCount: sql<number>`count(case when ${truckReports.id} is not null and ${truckReports.assignedTo} is null then 1 end)`,
  }).from(user).leftJoin(
    truckReports,
    eq(user.id, mode === "created" ? truckReports.userId : truckReports.assignedTo),
  ).where(gt(user.archivedAt, 0)).groupBy(user.id).orderBy(desc(max(truckReports.createdAt)), asc(user.email));

  return rows.map(row => ({
    ...row,
    amount: Number(row.amount),
    latestReportAt: row.latestReportAt === null ? null : Number(row.latestReportAt),
    repairedReportCount: Number(row.repairedReportCount),
    unrepairedReportCount: Number(row.unrepairedReportCount),
    assignedReportCount: Number(row.assignedReportCount),
    unassignedReportCount: Number(row.unassignedReportCount),
  }));
}

export async function findUserById(userId: number) {
  return db.query.user.findFirst({
    where: (fields, operators) => operators.eq(fields.id, userId),
  });
}

export async function findUserByEmail(email: string) {
  return db.query.user.findFirst({
    where: (fields, operators) => operators.eq(fields.email, email),
  });
}

export async function searchUsers(searchTerm: string, limit = 8): Promise<UserSearchResult[]> {
  const match = `%${searchTerm.trim()}%`;

  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    archivedAt: user.archivedAt,
  }).from(user).where(or(
    like(user.name, match),
    like(user.email, match),
  )).orderBy(user.name).limit(limit);
}

export async function archiveUserById(userId: number) {
  const [archived] = await db.update(user).set({ archivedAt: Date.now() }).where(eq(user.id, userId)).returning();
  return archived;
}

export async function restoreUserById(userId: number) {
  const [restored] = await db.update(user).set({ archivedAt: 0 }).where(eq(user.id, userId)).returning();
  return restored;
}

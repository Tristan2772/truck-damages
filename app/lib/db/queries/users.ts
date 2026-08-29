import { asc, count, desc, eq, like, max, or } from "drizzle-orm";

import db from "..";
import { truckReports, user } from "../schema";

export type UserSearchResult = Pick<typeof user.$inferSelect, "id" | "name" | "email">;
export type UserWithReportCount = UserSearchResult & { amount: number; latestReportAt: number | null };

export async function findAllUsers(): Promise<UserWithReportCount[]> {
  const rows = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    amount: count(truckReports.id),
    latestReportAt: max(truckReports.createdAt),
  }).from(user).leftJoin(
    truckReports,
    eq(user.id, truckReports.userId),
  ).groupBy(user.id).orderBy(desc(max(truckReports.createdAt)), asc(user.email));

  return rows.map(row => ({
    ...row,
    amount: Number(row.amount),
    latestReportAt: row.latestReportAt === null ? null : Number(row.latestReportAt),
  }));
}

export async function findUserById(userId: number) {
  return db.query.user.findFirst({
    where: (fields, operators) => operators.eq(fields.id, userId),
  });
}

export async function searchUsers(searchTerm: string, limit = 8): Promise<UserSearchResult[]> {
  const match = `%${searchTerm.trim()}%`;

  return db.select({
    id: user.id,
    name: user.name,
    email: user.email,
  }).from(user).where(or(
    like(user.name, match),
    like(user.email, match),
  )).orderBy(user.name).limit(limit);
}
